import type { Week, WeeklyReflection } from "./week";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isReflection(value: unknown): value is WeeklyReflection {
  return (
    isRecord(value) &&
    typeof value.wentWell === "string" &&
    typeof value.difficult === "string" &&
    typeof value.nextWeekFocus === "string"
  );
}

/**
 * Normalizes one raw stored record to the current Week shape — the
 * `createSyncedStore` `normalize` hook (same role as `migrateHabit` /
 * `migrateJournalNote` / `normalizeDay`). Unlike Day, Week never had a
 * legacy key-format problem (its id was always the canonical week-start
 * date key), so this one function is also all `migrateWeeksToCloud` needs:
 * the generic engine's own legacy-key adoption plus this normalize hook is
 * enough, with no separate one-time import step required.
 */
export function normalizeWeek(raw: unknown): Week | null {
  if (!isRecord(raw)) {
    return null;
  }

  if (typeof raw.id !== "string") {
    return null;
  }

  return {
    id: raw.id,
    reflection: isReflection(raw.reflection)
      ? raw.reflection
      : { wentWell: "", difficult: "", nextWeekFocus: "" },
    focusLifeAreaId: typeof raw.focusLifeAreaId === "string" ? raw.focusLifeAreaId : undefined,
    deletedAt: typeof raw.deletedAt === "string" ? raw.deletedAt : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
  };
}
