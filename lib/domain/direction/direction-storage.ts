import storage from "@/lib/storage/storage";
import { createSyncedStore, type SyncedStore } from "@/lib/sync/createSyncedStore";
import { readActiveAtmosphere } from "@/lib/domain/atmosphere/atmosphere";
import { listLive, resolveCurrent, shouldAppend } from "@/lib/domain/revisions/revision";
import {
  createDirectionRevision,
  createEmptyDirectionRevision,
  type DirectionRevision,
} from "./direction";
import { normalizeDirectionRevision, parseLegacyDirection } from "./direction-migrations";

export const LIFE_DIRECTION_STORAGE_KEY = "ser.direction";

interface DirectionRevisionRow {
  id: string;
  user_id: string;
  statement: string;
  supersedes: string | null;
  atmosphere: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: DirectionRevisionRow): DirectionRevision {
  return Object.freeze({
    id: row.id,
    statement: row.statement,
    supersedes: row.supersedes,
    atmosphere: row.atmosphere,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function toRow(revision: DirectionRevision, userId: string): DirectionRevisionRow {
  return {
    id: revision.id,
    user_id: userId,
    statement: revision.statement,
    supersedes: revision.supersedes,
    atmosphere: revision.atmosphere,
    deleted_at: revision.deletedAt,
    created_at: revision.createdAt,
    updated_at: revision.updatedAt,
  };
}

/**
 * Direction is a chain of revisions, not a value.
 *
 * It used to be a singleton: one row per user under a fixed id, overwritten
 * on every save. Someone who rewrote their direction in 2029 destroyed what
 * they believed in 2026, with no copy anywhere. CONSTITUTION.md, Second Law
 * corollary — nothing meaningful is ever overwritten.
 *
 * The store itself needed no changes. `createSyncedStore` was always a
 * `Record<id, entity>`; Direction was the anomaly for holding exactly one.
 * Every revision now carries its own id, which also removes a whole class of
 * sync conflict — two devices can no longer fight over the same row, because
 * they no longer write to the same row.
 *
 * The exposed surface is deliberately narrowed. `update()` mutates in place
 * and bumps `updatedAt`; one call to it would destroy the immutability this
 * module exists to guarantee. Leaving it off this type makes that a compile
 * error rather than something a reviewer has to catch. `remove()` is off for
 * the same reason — nothing deletes a revision yet, so nothing should be able
 * to.
 */
type DirectionStore = Pick<
  SyncedStore<DirectionRevision>,
  "getAll" | "save" | "subscribe" | "setUserId" | "pull" | "runInitialMigration"
>;

const store: DirectionStore = createSyncedStore<DirectionRevision, DirectionRevisionRow>({
  storageKey: LIFE_DIRECTION_STORAGE_KEY,
  table: "direction",
  normalize: normalizeDirectionRevision,
  fromRow,
  toRow,
});

/**
 * The statement that is true right now.
 *
 * Never null, so the screens that only want to show the current sentence do
 * not each have to handle "nothing written yet". The empty stand-in is never
 * stored.
 */
export function getLifeDirection(): DirectionRevision {
  return resolveCurrent(store.getAll()) ?? createEmptyDirectionRevision();
}

/**
 * Everything written before the current statement, newest first.
 *
 * Ordering is computed here rather than inherited from the store's own sort,
 * so that display order stays a decision of this domain rather than a
 * coincidence of how the sync engine happens to sort its cache today.
 */
export function getDirectionHistory(): DirectionRevision[] {
  const revisions = store.getAll();
  const current = resolveCurrent(revisions);

  return listLive(revisions).filter((revision) => revision.id !== current?.id);
}

/**
 * Appends a revision, or does nothing.
 *
 * Returns null when nothing was written — unchanged text, or empty text —
 * so the caller can tell "saved" from "no-op" without comparing strings
 * again. From the person's side both are success: their words are safe
 * either way, and a history should not fill with duplicates because someone
 * pressed Guardar twice.
 *
 * This is the only place in the module that knows what time it is or where
 * the person is sitting. Everything it depends on — appending or not,
 * resolving the current revision, building the record — is pure and tested
 * without a browser.
 */
export function saveLifeDirection(statement: string): DirectionRevision | null {
  const current = resolveCurrent(store.getAll());

  if (!shouldAppend(current?.statement ?? null, statement)) {
    return null;
  }

  const revision = createDirectionRevision({
    id: crypto.randomUUID(),
    now: new Date().toISOString(),
    statement: statement.trim(),
    supersedes: current?.id ?? null,
    atmosphere: readActiveAtmosphere(),
  });

  store.save(revision);

  return revision;
}

export function subscribeToLifeDirection(listener: () => void): () => void {
  return store.subscribe(listener);
}

export function setLifeDirectionSyncUserId(userId: string | null): void {
  store.setUserId(userId);
}

export function pullLifeDirection(): Promise<void> {
  return store.pull();
}

/**
 * One-time legacy import. Direction is the one domain whose oldest
 * localStorage shape was not a `Record<id, entity>` — it was a flat
 * `{ statement, updatedAt }` object stored directly under `ser.direction`,
 * with no id at all. Handed that, the sync engine's automatic legacy-key
 * adoption would iterate `"statement"` and `"updatedAt"` as if they were
 * entity ids and lose the data, so it is read here first, before any
 * `store.*` call can adopt and clear that key.
 *
 * The parsing itself lives in `direction-migrations.ts` as a pure function;
 * this only supplies the raw value and the clock.
 */
export async function migrateLifeDirectionToCloud(): Promise<void> {
  const raw = storage.get<unknown>(LIFE_DIRECTION_STORAGE_KEY, undefined);
  const legacy = parseLegacyDirection(raw, new Date().toISOString());

  if (legacy) {
    store.save(legacy);
  }

  await store.runInitialMigration();
}
