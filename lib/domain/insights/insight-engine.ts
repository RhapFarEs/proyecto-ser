import type { Day } from "@/lib/domain/day/day";
import { isHabitScheduledOn, type Habit, type Weekday } from "@/lib/domain/habit/habit";
import { isHabitCompleted } from "@/lib/domain/day/day-habits";
import { hasClosingReflection } from "@/lib/domain/day/day-reflection";
import { addDaysToKey, getLocalDateKey, getWeekdayOfKey } from "@/lib/date";
import type { Insight } from "./insight";

/**
 * Consecutive calendar days, walking backward from `referenceDateKey`, that
 * have at least one recorded Entry. A pure computation, kept available for
 * future use (e.g. a "Path" visualization) — not currently surfaced in any
 * UI. A streak counter is exactly the "don't break the chain" pressure this
 * product's principles reject (VOCABULARY.md: "Streak → Path — the process
 * is prioritized over the accumulation of days"). Also a plausible input
 * for a future Journey domain (a narrative view across days/weeks) — no
 * such domain exists yet.
 */
export function getCurrentStreak(
  days: Day[],
  referenceDateKey: string = getLocalDateKey(),
): number {
  const daysByKey = new Map(days.map((day) => [day.date, day]));
  let streak = 0;
  let cursor = referenceDateKey;

  while (true) {
    const day = daysByKey.get(cursor);

    if (!day || day.entries.length === 0) {
      break;
    }

    streak += 1;
    cursor = addDaysToKey(cursor, -1);
  }

  return streak;
}

/** Active habits scheduled for and completed on the given day. */
export function getCompletedHabitsToday(day: Day, habits: Habit[]): Habit[] {
  const weekday = getWeekdayOfKey(day.date) as Weekday;

  return habits.filter(
    (habit) =>
      habit.active && isHabitScheduledOn(habit, weekday) && isHabitCompleted(day, habit.id),
  );
}

/** Whether a journal entry exists for the given day. */
export function getJournalStatusToday(day: Day): boolean {
  return day.entries.some((entry) => entry.type === "journal");
}

/** Whether a closing reflection exists for the given day. */
export function getClosingReflectionStatusToday(day: Day): boolean {
  return hasClosingReflection(day);
}

/**
 * Fraction (0-1) of (day x habit scheduled for that day's weekday) pairs
 * completed across `days`. A pure computation, kept available for future
 * use — not currently surfaced in any UI. A completion percentage is
 * exactly the "score" this product's principles reject.
 */
export function getWeeklyCompletionRate(days: Day[], habits: Habit[]): number {
  if (days.length === 0) {
    return 0;
  }

  let totalSlots = 0;
  let completedSlots = 0;

  for (const day of days) {
    const weekday = getWeekdayOfKey(day.date) as Weekday;
    const scheduledHabits = habits.filter(
      (habit) => habit.active && isHabitScheduledOn(habit, weekday),
    );

    totalSlots += scheduledHabits.length;
    completedSlots += scheduledHabits.filter((habit) => isHabitCompleted(day, habit.id)).length;
  }

  return totalSlots === 0 ? 0 : completedSlots / totalSlots;
}

/**
 * Selects at most one calm, qualitative insight for today — never a count,
 * streak, or percentage. Returns null when nothing meaningful has happened
 * yet today, which is a valid, ordinary state, not a gap to fill.
 */
export function getTodayInsight(day: Day, habits: Habit[]): Insight | null {
  const completedHabits = getCompletedHabitsToday(day, habits);

  if (completedHabits.length > 0) {
    return {
      id: "habits-completed-today",
      message: `Hoy ya sostuviste ${completedHabits
        .map((habit) => habit.title)
        .join(", ")}.`,
    };
  }

  if (getJournalStatusToday(day)) {
    return {
      id: "journal-written-today",
      message: "Hoy ya dedicaste un momento para escribir.",
    };
  }

  if (getClosingReflectionStatusToday(day)) {
    return {
      id: "closing-reflection-today",
      message: "Hoy ya cerraste este día con una reflexión.",
    };
  }

  return null;
}
