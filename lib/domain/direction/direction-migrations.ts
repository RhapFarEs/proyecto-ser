import { LIFE_DIRECTION_ID, type LifeDirection } from "./direction";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Normalizes one raw stored record to the current LifeDirection shape —
 * the `createSyncedStore` `normalize` hook (same role as `migrateHabit` /
 * `normalizeWeek` / `normalizeLifeArea`). `id` is always the fixed
 * constant `LIFE_DIRECTION_ID` here, never read from the raw record —
 * there is only ever one Direction per user.
 */
export function normalizeLifeDirection(raw: unknown): LifeDirection | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    id: LIFE_DIRECTION_ID,
    statement: typeof raw.statement === "string" ? raw.statement : "",
    deletedAt: typeof raw.deletedAt === "string" ? raw.deletedAt : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
  };
}
