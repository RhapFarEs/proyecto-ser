import { createSyncedStore } from "@/lib/sync/createSyncedStore";
import { createWeek, type Week } from "./week";
import { normalizeWeek } from "./week-migrations";

export const WEEK_STORAGE_KEY = "ser.weeks";

interface WeekRow {
  id: string;
  user_id: string;
  reflection: Week["reflection"];
  focus_life_area_id: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: WeekRow): Week {
  return {
    id: row.id,
    reflection: row.reflection,
    focusLifeAreaId: row.focus_life_area_id ?? undefined,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(week: Week, userId: string): WeekRow {
  return {
    id: week.id,
    user_id: userId,
    reflection: week.reflection,
    focus_life_area_id: week.focusLifeAreaId ?? null,
    deleted_at: week.deletedAt,
    created_at: week.createdAt,
    updated_at: week.updatedAt,
  };
}

/**
 * Week follows the same `createSyncedStore` wiring as Habit/Journal/Day —
 * see `lib/domain/habit/habit-storage.ts` for the reference. Like Day,
 * `id` is a calendar key (the week-start date), unique only *within* one
 * user's data — the `weeks` table's primary key is `(id, user_id)`, not
 * `id` alone (see the migration SQL).
 *
 * Unlike Day, Week never had a legacy key-format problem, so there's no
 * custom one-time import step here: `migrateWeeksToCloud` is exactly as
 * simple as Habit's, relying entirely on the generic engine's own
 * legacy-key adoption + `normalizeWeek`.
 */
const store = createSyncedStore<Week, WeekRow>({
  storageKey: WEEK_STORAGE_KEY,
  table: "weeks",
  normalize: normalizeWeek,
  fromRow,
  toRow,
});

export function getWeek(id: string): Week {
  return store.getOne(id) ?? createWeek(id);
}

export function getWeeks(): Week[] {
  return store.getAll();
}

/**
 * Always succeeds, even for a week with no existing record — the same
 * "create on first write" contract Day's `updateDay` preserves, and that
 * WeeklyReviewView already relies on for both focus-area selection and
 * reflection saves.
 */
export function updateWeek(id: string, updater: (week: Week) => Week): Week {
  const current = getWeek(id);
  const next: Week = { ...updater(current), updatedAt: new Date().toISOString() };
  store.save(next);
  return next;
}

export function setWeekSyncUserId(userId: string | null): void {
  store.setUserId(userId);
}

export function pullWeeks(): Promise<void> {
  return store.pull();
}

export function migrateWeeksToCloud(): Promise<void> {
  return store.runInitialMigration();
}
