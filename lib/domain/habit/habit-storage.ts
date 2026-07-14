import { createSyncedStore } from "@/lib/sync/createSyncedStore";
import { type Habit, type Weekday } from "./habit";
import { migrateHabit } from "./habit-migrations";

export const HABIT_STORAGE_KEY = "ser.habits";

interface HabitRow {
  id: string;
  user_id: string;
  title: string;
  purpose: string;
  weekdays: Weekday[];
  active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: HabitRow): Habit {
  return {
    id: row.id,
    title: row.title,
    purpose: row.purpose,
    weekdays: row.weekdays,
    active: row.active,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(habit: Habit, userId: string): HabitRow {
  return {
    id: habit.id,
    user_id: userId,
    title: habit.title,
    purpose: habit.purpose,
    weekdays: habit.weekdays,
    active: habit.active,
    deleted_at: habit.deletedAt,
    created_at: habit.createdAt,
    updated_at: habit.updatedAt,
  };
}

/**
 * Habit is the reference domain for `createSyncedStore` — every call below
 * keeps the exact public API the rest of the app already calls
 * (getHabits/saveHabit/updateHabit/removeHabit), so no component needed to
 * change when this domain went from localStorage-only to cloud-synced.
 * `setHabitSyncUserId`/`pullHabits`/`migrateHabitsToCloud` are the new
 * surface, called only from the auth bootstrap (see `lib/auth/AuthContext.tsx`),
 * never from a component.
 */
const store = createSyncedStore<Habit, HabitRow>({
  storageKey: HABIT_STORAGE_KEY,
  table: "habits",
  normalize: migrateHabit,
  fromRow,
  toRow,
});

export function getHabits(): Habit[] {
  return store.getAll();
}

export function getHabit(id: string): Habit | undefined {
  return store.getOne(id);
}

export function saveHabit(habit: Habit): void {
  store.save(habit);
}

export function updateHabit(
  id: string,
  updater: (habit: Habit) => Habit,
): Habit | undefined {
  return store.update(id, updater);
}

export function removeHabit(id: string): void {
  store.remove(id);
}

export function subscribeToHabits(listener: () => void): () => void {
  return store.subscribe(listener);
}

export function setHabitSyncUserId(userId: string | null): void {
  store.setUserId(userId);
}

export function pullHabits(): Promise<void> {
  return store.pull();
}

export function migrateHabitsToCloud(): Promise<void> {
  return store.runInitialMigration();
}
