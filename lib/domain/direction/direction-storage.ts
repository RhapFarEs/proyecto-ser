import storage from "@/lib/storage/storage";
import { createSyncedStore, type SyncedStore } from "@/lib/sync/createSyncedStore";
import { listLive, resolveCurrent } from "@/lib/domain/revisions/revision";
import { appendDirectionRevision, directionRevision, type DirectionRevision } from "./direction";
import {
  normalizeDirectionRevision,
  parseLegacyDirection,
  repairFabricatedDate,
} from "./direction-migrations";

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
  return directionRevision({
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
 * This module is a shell. It owns the impure edges — what time it is, which
 * id to mint, what is on disk — and nothing else; every decision it appears
 * to make is made by a pure function it calls.
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
  "getAll" | "save" | "setUserId" | "pull" | "runInitialMigration"
>;

const store: DirectionStore = createSyncedStore<DirectionRevision, DirectionRevisionRow>({
  storageKey: LIFE_DIRECTION_STORAGE_KEY,
  table: "direction",
  normalize: normalizeDirectionRevision,
  fromRow,
  toRow,
});

/**
 * The statement that is true right now, or null when nothing has been
 * written.
 *
 * Null rather than an empty stand-in. A placeholder revision saved three
 * callers a `?.`, and in exchange put an object in circulation that was
 * indistinguishable from a real one — same shape, plausible dates, and the
 * legacy id, which is the id of the person's actual first statement. Any
 * future code that persisted it would have overwritten the oldest thing they
 * wrote. Absence should look like absence.
 */
export function getLifeDirection(): DirectionRevision | null {
  return resolveCurrent(store.getAll());
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
 * Every varying input is supplied here and passed down: the id, the clock,
 * and the atmosphere, which the caller reads from the room the person is
 * actually sitting in. An earlier version reached for `document` from inside
 * this module, which made the append path impossible to test and meant that
 * calling it anywhere without a DOM silently recorded no atmosphere at all —
 * a quiet loss of archive quality rather than an error.
 *
 * Returns null when nothing was written, so the caller can tell "saved" from
 * "no-op". From the person's side both are success: their words are safe
 * either way.
 */
export function saveLifeDirection(
  statement: string,
  atmosphere: string | null,
): DirectionRevision | null {
  const revision = appendDirectionRevision(store.getAll(), statement, {
    id: crypto.randomUUID(),
    now: new Date().toISOString(),
    atmosphere,
  });

  if (revision) {
    store.save(revision);
  }

  return revision;
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
 * Also repairs records already imported by an earlier version, which stamped
 * their own run time into `createdAt`. Writing the correction back means it
 * happens to the data once, rather than being re-derived on every read
 * forever — and because the repair returns null when there is nothing to fix,
 * running this again is free.
 *
 * Both the parsing and the repair are pure functions living in
 * `direction-migrations.ts`; this only supplies the raw value and the clock.
 */
export async function migrateLifeDirectionToCloud(): Promise<void> {
  const raw = storage.get<unknown>(LIFE_DIRECTION_STORAGE_KEY, undefined);
  const legacy = parseLegacyDirection(raw, new Date().toISOString());

  if (legacy) {
    store.save(legacy);
  }

  for (const revision of store.getAll()) {
    const repaired = repairFabricatedDate(revision);

    if (repaired) {
      store.save(repaired);
    }
  }

  await store.runInitialMigration();
}
