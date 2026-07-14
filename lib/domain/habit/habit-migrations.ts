import { ALL_WEEKDAYS, type Habit, type Weekday } from "./habit";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isWeekdayArray(value: unknown): value is Weekday[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "number" && item >= 0 && item <= 6)
  );
}

/**
 * Normalizes one raw stored record to the current Habit shape. Always
 * rebuilds the object field-by-field rather than returning early for
 * already-current-looking records — that's what lets a field like
 * `deletedAt`, added after some records were written, get backfilled
 * (`null`, i.e. "not deleted") instead of silently staying `undefined`.
 *
 * Legacy records used `frequency: "daily" | "weekly"` instead of
 * `weekdays`:
 * - "daily" becomes every weekday — equivalent to the prior behavior.
 * - "weekly" becomes Monday only. The old shape never recorded which day,
 *   so this is a documented default, not a recovered fact — migrated
 *   "weekly" habits should be reviewed and their days adjusted.
 */
export function migrateHabit(raw: unknown): Habit | null {
  if (!isRecord(raw)) {
    return null;
  }

  const weekdays: Weekday[] = isWeekdayArray(raw.weekdays)
    ? raw.weekdays
    : raw.frequency === "weekly"
      ? [1]
      : ALL_WEEKDAYS;

  return {
    id: typeof raw.id === "string" ? raw.id : crypto.randomUUID(),
    title: typeof raw.title === "string" ? raw.title : "",
    purpose: typeof raw.purpose === "string" ? raw.purpose : "",
    weekdays,
    active: typeof raw.active === "boolean" ? raw.active : true,
    deletedAt: typeof raw.deletedAt === "string" ? raw.deletedAt : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
  };
}
