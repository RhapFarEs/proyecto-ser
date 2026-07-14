import storage from "@/lib/storage/storage";
import { createSyncedStore } from "@/lib/sync/createSyncedStore";
import { createLifeDirection, LIFE_DIRECTION_ID, type LifeDirection } from "./direction";
import { normalizeLifeDirection } from "./direction-migrations";

export const LIFE_DIRECTION_STORAGE_KEY = "ser.direction";

interface LifeDirectionRow {
  id: string;
  user_id: string;
  statement: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: LifeDirectionRow): LifeDirection {
  return {
    id: row.id,
    statement: row.statement,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(direction: LifeDirection, userId: string): LifeDirectionRow {
  return {
    id: direction.id,
    user_id: userId,
    statement: direction.statement,
    deleted_at: direction.deletedAt,
    created_at: direction.createdAt,
    updated_at: direction.updatedAt,
  };
}

/**
 * Direction is a singleton per user — exactly one LifeDirection, always
 * stored under the fixed id `LIFE_DIRECTION_ID` — but otherwise follows
 * the same `createSyncedStore` wiring as every other domain (see
 * `lib/domain/habit/habit-storage.ts` for the reference). Because `id` is
 * a constant, never a random UUID or a per-user-unique date key, it is
 * never unique on its own — the `direction` table's primary key is
 * `(id, user_id)`, same reasoning as `days`/`weeks`, just the most
 * extreme case of it (every row shares the exact same `id`).
 */
const store = createSyncedStore<LifeDirection, LifeDirectionRow>({
  storageKey: LIFE_DIRECTION_STORAGE_KEY,
  table: "direction",
  normalize: normalizeLifeDirection,
  fromRow,
  toRow,
});

export function getLifeDirection(): LifeDirection {
  return store.getOne(LIFE_DIRECTION_ID) ?? createLifeDirection();
}

export function saveLifeDirection(statement: string): LifeDirection {
  const current = getLifeDirection();
  const next: LifeDirection = { ...current, statement, updatedAt: new Date().toISOString() };
  store.save(next);
  return next;
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
 * One-time legacy import: Direction is the one domain whose *legacy*
 * localStorage shape isn't already a Record-of-entities like every other
 * domain's — it was a single flat `{statement, updatedAt}` object stored
 * directly under `ser.direction`, with no `id` at all. The generic
 * engine's automatic legacy-key adoption assumes the flat key already
 * holds a `Record<id, entity>`; handed this flat object instead, it would
 * iterate `"statement"`/`"updatedAt"` as if they were entity ids and lose
 * the data. So, like Day's `importLegacyDays`, this reads the raw flat
 * key directly and wraps it into the current entity shape once, before
 * any `store.*` call gets a chance to touch (and adopt-then-delete) that
 * same flat key.
 */
function importLegacyDirection(): LifeDirection | null {
  const raw = storage.get<unknown>(LIFE_DIRECTION_STORAGE_KEY, undefined);

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const value = raw as Record<string, unknown>;

  if (typeof value.statement !== "string") {
    return null;
  }

  const now = new Date().toISOString();

  return {
    id: LIFE_DIRECTION_ID,
    statement: value.statement,
    deletedAt: null,
    createdAt: now,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : now,
  };
}

export async function migrateLifeDirectionToCloud(): Promise<void> {
  const legacy = importLegacyDirection();

  if (legacy) {
    store.save(legacy);
  }

  await store.runInitialMigration();
}
