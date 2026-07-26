import type { Day } from "@/lib/domain/day/day";
import { isHabitScheduledOn, type Habit, type Weekday } from "@/lib/domain/habit/habit";
import { isHabitCompleted } from "@/lib/domain/day/day-habits";
import { hasClosingReflection } from "@/lib/domain/day/day-reflection";
import { getWeekdayOfKey } from "@/lib/date";
import type { Insight } from "./insight";

/**
 * Joins titles the way a person would say them: "Meditar", "Meditar y
 * Caminar", "Meditar, Caminar y Leer" — never a raw comma dump.
 */
function joinNaturally(titles: string[]): string {
  if (titles.length <= 1) {
    return titles.join("");
  }

  return `${titles.slice(0, -1).join(", ")} y ${titles[titles.length - 1]}`;
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
 * Selects at most one calm, qualitative insight for today — never a count,
 * streak, or percentage. Returns null when nothing meaningful has happened
 * yet today, which is a valid, ordinary state, not a gap to fill.
 *
 * Priority order is deliberate: an action taken (a practice sustained)
 * outranks words written, which outrank an intention declared — the quiet
 * acknowledgment always names the most tangible true thing about the day.
 */
export function getTodayInsight(day: Day, habits: Habit[]): Insight | null {
  const completedHabits = getCompletedHabitsToday(day, habits);

  if (completedHabits.length > 0) {
    return {
      id: "habits-completed-today",
      message: `Hoy ya sostuviste ${joinNaturally(
        completedHabits.map((habit) => habit.title),
      )}.`,
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

  if (day.intention.trim().length > 0) {
    return {
      id: "intention-set-today",
      message: "Hoy ya dejaste clara tu intención. Con eso basta para empezar.",
    };
  }

  return null;
}
