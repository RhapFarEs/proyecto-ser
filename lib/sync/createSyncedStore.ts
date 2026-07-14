import storage from "@/lib/storage/storage";
import { supabase } from "@/lib/supabase/client";
import type { SyncableEntity } from "./types";

type Listener = () => void;

export interface SyncedStoreConfig<T extends SyncableEntity, Row> {
  /** localStorage key for this domain's cache — the same key a plain localStorage-only domain would already use. */
  storageKey: string;
  /** Supabase table name. Rows are scoped to the signed-in user via a `user_id` column. */
  table: string;
  /** Normalizes one raw stored record (any past shape) into the current entity type, or null if unrecoverable. */
  normalize: (raw: unknown) => T | null;
  /** Maps a Supabase row to the domain entity. */
  fromRow: (row: Row) => T;
  /** Maps a domain entity to a Supabase row, stamping the owning user. */
  toRow: (entity: T, userId: string) => Row;
}

export interface SyncedStore<T extends SyncableEntity> {
  getAll(): T[];
  getOne(id: string): T | undefined;
  save(entity: T): void;
  update(id: string, updater: (entity: T) => T): T | undefined;
  remove(id: string): void;
  subscribe(listener: Listener): () => void;
  setUserId(userId: string | null): void;
  pull(): Promise<void>;
  runInitialMigration(): Promise<void>;
}

/**
 * The reference sync engine every cloud-backed domain in Proyecto SER
 * shares: Memory -> localStorage -> Supabase, offline-first, with "newest
 * `updatedAt` wins" as the only conflict rule — no CRDTs, no merge prompts.
 * Habit is the first domain wired to this; Day, Week, Life Area, Direction,
 * and Journal can each get their own instance later by supplying their own
 * storageKey/table/normalize/fromRow/toRow, reusing everything else as-is.
 *
 * Reads (`getAll`/`getOne`) only ever touch the in-memory cache — callers
 * never wait on the network. Writes update memory and localStorage
 * synchronously, then fire an async, best-effort push to Supabase; a push
 * that fails (offline, etc.) leaves the entity's id in a small pending set
 * in localStorage, which the next `pull()` retries before fetching remote
 * changes.
 *
 * Every localStorage key is namespaced by the current `userId` (set via
 * `setUserId`), so switching accounts on the same device can never read or
 * write another account's cached data — see `storageKeyFor`.
 */
export function createSyncedStore<T extends SyncableEntity, Row>(
  config: SyncedStoreConfig<T, Row>,
): SyncedStore<T> {
  let userId: string | null = null;
  let memory: Record<string, T> | null = null;
  let cachedSnapshot: T[] | null = null;
  const listeners = new Set<Listener>();

  function notify(): void {
    cachedSnapshot = null;

    for (const listener of listeners) {
      listener();
    }
  }

  // Every key is namespaced by the signed-in user once one is known, so two
  // accounts on the same browser never read or write each other's cache.
  // With no user known yet (signed out, or not-yet-authenticated), reads and
  // writes fall back to the bare `config.storageKey` — the same flat key
  // this domain used before namespacing existed.
  function storageKeyFor(uid: string | null): string {
    return uid ? `${config.storageKey}::${uid}` : config.storageKey;
  }

  function pendingKeyFor(uid: string | null): string {
    return `${storageKeyFor(uid)}.pending`;
  }

  /**
   * A device's very first namespaced user inherits whatever was under the
   * flat legacy key (data written before this domain was namespaced at
   * all) and the flat key is then deleted — so a *different* second
   * account logging in afterward finds nothing left to inherit. Without
   * deleting it, every subsequent account on the same device would adopt
   * the same leftover data, which is exactly the leak this exists to
   * prevent.
   */
  function adoptLegacyDataIfNeeded(uid: string): void {
    const namespacedKey = storageKeyFor(uid);
    const alreadyNamespaced = storage.get<unknown>(namespacedKey, undefined) !== undefined;

    if (alreadyNamespaced) {
      return;
    }

    const legacyValue = storage.get<unknown>(config.storageKey, undefined);

    if (legacyValue !== undefined) {
      storage.set(namespacedKey, legacyValue);
      storage.remove(config.storageKey);
    }

    const legacyPendingKey = `${config.storageKey}.pending`;
    const legacyPending = storage.get<unknown>(legacyPendingKey, undefined);

    if (legacyPending !== undefined) {
      storage.set(pendingKeyFor(uid), legacyPending);
      storage.remove(legacyPendingKey);
    }
  }

  function loadFromLocalStorage(): Record<string, T> {
    if (userId) {
      adoptLegacyDataIfNeeded(userId);
    }

    const key = storageKeyFor(userId);
    const storedValue = storage.get<Record<string, unknown>>(key, {});

    if (!storedValue || typeof storedValue !== "object") {
      return {};
    }

    const normalized: Record<string, T> = {};
    let needsPersist = false;

    for (const [entryKey, rawValue] of Object.entries(storedValue)) {
      const migrated = config.normalize(rawValue);

      if (!migrated) {
        continue;
      }

      if (JSON.stringify(rawValue) !== JSON.stringify(migrated)) {
        needsPersist = true;
      }

      normalized[entryKey] = migrated;
    }

    if (needsPersist) {
      storage.set(key, normalized);
    }

    return normalized;
  }

  function ensureMemory(): Record<string, T> {
    if (!memory) {
      memory = loadFromLocalStorage();
    }

    return memory;
  }

  function persist(): void {
    storage.set(storageKeyFor(userId), ensureMemory());
  }

  function getPendingIds(): Set<string> {
    return new Set(storage.get<string[]>(pendingKeyFor(userId), []));
  }

  function setPendingIds(ids: Set<string>): void {
    storage.set(pendingKeyFor(userId), Array.from(ids));
  }

  function markPending(id: string): void {
    const pending = getPendingIds();
    pending.add(id);
    setPendingIds(pending);
  }

  function clearPending(id: string): void {
    const pending = getPendingIds();

    if (pending.delete(id)) {
      setPendingIds(pending);
    }
  }

  async function pushOne(entity: T): Promise<void> {
    markPending(entity.id);

    if (!userId) {
      return;
    }

    try {
      // `config.table` is a plain string (not a literal Database-schema key,
      // since this client has no generic schema type), so postgrest-js can't
      // structurally verify `Row` against it — one explicit cast here, same
      // as the single justified cast already used at each domain's Supabase
      // response boundary (e.g. `profile-storage.ts`'s `data as ProfileRow`).
      const { error } = await supabase
        .from(config.table)
        .upsert(config.toRow(entity, userId) as Record<string, unknown>);

      if (error) {
        throw error;
      }

      clearPending(entity.id);
    } catch {
      // Left marked pending — the next pull() retries it.
    }
  }

  function getAll(): T[] {
    if (!cachedSnapshot) {
      cachedSnapshot = Object.values(ensureMemory())
        .filter((entity) => !entity.deletedAt)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return cachedSnapshot;
  }

  function getOne(id: string): T | undefined {
    return ensureMemory()[id];
  }

  function save(entity: T): void {
    ensureMemory()[entity.id] = entity;
    persist();
    notify();
    void pushOne(entity);
  }

  function update(id: string, updater: (entity: T) => T): T | undefined {
    const current = getOne(id);

    if (!current) {
      return undefined;
    }

    const next: T = { ...updater(current), updatedAt: new Date().toISOString() };
    save(next);
    return next;
  }

  function remove(id: string): void {
    const current = getOne(id);

    if (!current) {
      return;
    }

    save({ ...current, deletedAt: new Date().toISOString() });
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  /**
   * Dropping `memory` (and its cached snapshot) whenever the user actually
   * changes is what prevents a leak: the next read has to go back through
   * `ensureMemory()` -> `loadFromLocalStorage()`, which resolves the key
   * for the *new* `userId` — so nothing from the previous account's
   * in-memory cache can be returned, even for a single call, after
   * switching accounts.
   */
  function setUserId(nextUserId: string | null): void {
    if (nextUserId !== userId) {
      memory = null;
      cachedSnapshot = null;
    }

    userId = nextUserId;
  }

  /**
   * Pulls every remote row for the signed-in user, merging each one into
   * the local cache only if it's newer than what's already there — this is
   * the entire conflict strategy ("newest `updatedAt` wins"). Runs any
   * pending pushes first, so a write made while offline gets a chance to
   * reach Supabase before this device asks it for the current state.
   */
  async function pull(): Promise<void> {
    if (!userId) {
      return;
    }

    const pendingIds = getPendingIds();

    for (const id of pendingIds) {
      const entity = getOne(id);

      if (entity) {
        await pushOne(entity);
      } else {
        clearPending(id);
      }
    }

    const { data, error } = await supabase.from(config.table).select("*").eq("user_id", userId);

    if (error || !data) {
      return;
    }

    const memoryStore = ensureMemory();
    let changed = false;

    for (const row of data as Row[]) {
      const remote = config.fromRow(row);
      const local: T | undefined = memoryStore[remote.id];

      if (!local || remote.updatedAt > local.updatedAt) {
        memoryStore[remote.id] = remote;
        changed = true;
      }
    }

    if (changed) {
      persist();
      notify();
    }
  }

  /**
   * One-time bulk upload for a device that already has local data from
   * before this domain was cloud-synced. Always an upsert keyed by `id`, so
   * calling it more than once (a retry, a second login) never duplicates
   * anything — it just re-writes the same rows.
   */
  async function runInitialMigration(): Promise<void> {
    if (!userId) {
      return;
    }

    const entities = Object.values(ensureMemory());

    for (const entity of entities) {
      await pushOne(entity);
    }
  }

  return {
    getAll,
    getOne,
    save,
    update,
    remove,
    subscribe,
    setUserId,
    pull,
    runInitialMigration,
  };
}
