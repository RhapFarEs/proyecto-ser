import storage from "@/lib/storage/storage";
import { supabase } from "@/lib/supabase/client";
import type { SyncableEntity } from "./types";
import { notifyDataChanged } from "./data-version";

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
  setUserId(userId: string | null): void;
  pull(): Promise<void>;
  runInitialMigration(): Promise<void>;
  /** How many of this domain's writes have not reached Supabase yet. */
  pendingCount(): number;
  /** Re-attempts every pending write. Safe to call at any time. */
  retryPending(): Promise<void>;
}

/**
 * Every store created by `createSyncedStore`, so the app can ask one
 * question across all domains at once ("is anything still only on this
 * device?") instead of six. Registration happens at module load, since
 * each domain creates its store as a module-level singleton.
 */
const registeredStores: { pendingCount(): number; retryPending(): Promise<void> }[] = [];
const syncStateListeners = new Set<Listener>();

function notifySyncStateChanged(): void {
  for (const listener of syncStateListeners) {
    listener();
  }
}

/** Total writes across every domain that haven't reached Supabase yet. */
export function getPendingWriteCount(): number {
  return registeredStores.reduce((total, store) => total + store.pendingCount(), 0);
}

/** Notifies whenever the pending count may have changed. */
export function subscribeToSyncState(listener: Listener): () => void {
  syncStateListeners.add(listener);
  return () => syncStateListeners.delete(listener);
}


/**
 * Re-attempts pending writes across every domain. Called on reconnect and
 * available to the UI; previously the only retry path was the next login,
 * so a write made while offline could sit queued for days.
 */
export async function retryAllPendingWrites(): Promise<void> {
  await Promise.all(registeredStores.map((store) => store.retryPending()));
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    void retryAllPendingWrites();
  });
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

  /*
    Every write goes through here: the cached snapshot is dropped so the
    next read rebuilds it, and the app is told something changed.

    Each store used to carry its own listener set as well, so a screen could
    subscribe to one domain. Nothing ever did — screens read several domains
    at once and want to know when any of them moved, which is what
    `notifyDataChanged` answers.
  */
  function notify(): void {
    cachedSnapshot = null;
    notifyDataChanged();
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
    notifySyncStateChanged();
  }

  function clearPending(id: string): void {
    const pending = getPendingIds();

    if (pending.delete(id)) {
      setPendingIds(pending);
      notifySyncStateChanged();
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

  /**
   * Dropping `memory` (and its cached snapshot) whenever the user actually
   * changes is what prevents a leak: the next read has to go back through
   * `ensureMemory()` -> `loadFromLocalStorage()`, which resolves the key
   * for the *new* `userId` — so nothing from the previous account's
   * in-memory cache can be returned, even for a single call, after
   * switching accounts.
   */
  function setUserId(nextUserId: string | null): void {
    const changed = nextUserId !== userId;

    if (changed) {
      memory = null;
      cachedSnapshot = null;
    }

    userId = nextUserId;

    // The pending queue is per-user and unreadable until a user is known,
    // so `pendingCount()` answers 0 for every domain until this runs. It
    // lands well after first paint (AuthContext only calls it once the
    // profile bootstrap finishes), so without this notification anything
    // already queued from a previous visit would stay invisible.
    if (changed) {
      notifySyncStateChanged();
    }
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

    await retryPending();

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

  function pendingCount(): number {
    return userId ? getPendingIds().size : 0;
  }

  /**
   * Retries every queued write. Entities that no longer exist locally are
   * dropped from the queue rather than retried forever.
   */
  async function retryPending(): Promise<void> {
    if (!userId) {
      return;
    }

    for (const id of getPendingIds()) {
      const entity = getOne(id);

      if (entity) {
        await pushOne(entity);
      } else {
        clearPending(id);
      }
    }
  }

  const store: SyncedStore<T> = {
    getAll,
    getOne,
    save,
    update,
    remove,
    setUserId,
    pull,
    runInitialMigration,
    pendingCount,
    retryPending,
  };

  registeredStores.push(store);

  return store;
}
