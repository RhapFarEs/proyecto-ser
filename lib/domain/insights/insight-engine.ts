import type { Day } from "@/lib/domain/day/day";
import { isHabitScheduledOn, type Habit, type Weekday } from "@/lib/domain/habit/habit";
import { isHabitCompleted } from "@/lib/domain/day/day-habits";
import { hasClosingReflection } from "@/lib/domain/day/day-reflection";
import { getWeekdayOfKey, parseLocalDateKey } from "@/lib/date";
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

/** Any trace at all that the person was here on this day. */
function hasPresence(day: Day): boolean {
  return (
    day.intention.trim().length > 0 ||
    hasClosingReflection(day) ||
    day.entries.some(
      (entry) =>
        entry.type === "journal" || (entry.type === "habit" && entry.completed),
    )
  );
}

/**
 * True when there is earlier history, and the most recent day with any
 * presence in it is far enough back to be worth a welcome.
 *
 * Requires prior history on purpose: someone's very first day is not a
 * return, and greeting them as one would be the app pretending to know
 * them.
 */
export function isReturningAfterAbsence(
  todayKey: string,
  history: Day[],
): boolean {
  const previous = history
    .filter((day) => day.date < todayKey && hasPresence(day))
    .map((day) => day.date)
    .sort();

  const last = previous[previous.length - 1];

  if (!last) {
    return false;
  }

  const daysApart = Math.round(
    (parseLocalDateKey(todayKey).getTime() - parseLocalDateKey(last).getTime()) /
      86_400_000,
  );

  return daysApart >= RETURN_THRESHOLD_DAYS;
}

/**
 * Days of quiet before a return is worth acknowledging. Below this it's an
 * ordinary gap — a weekend, a busy stretch — and saying anything would draw
 * attention to something that isn't a thing.
 */
const RETURN_THRESHOLD_DAYS = 5;

export type TimeOfDay = "morning" | "afternoon" | "evening";

/** Same boundaries as the greeting, so the two never disagree about the hour. */
export function getTimeOfDay(now: Date = new Date()): TimeOfDay {
  const hour = now.getHours();

  if (hour < 12) {
    return "morning";
  }

  return hour < 19 ? "afternoon" : "evening";
}

/**
 * Selects at most one calm observation for today — never a count, streak,
 * or percentage. Returns null when there is nothing true to say, which is
 * an ordinary state, not a gap to fill.
 *
 * The engine reads the hour because the product's whole arc does: mornings
 * are for setting a direction, evenings for looking back at it. The same
 * day state therefore produces a different line at 8am and at 10pm.
 *
 * In the evening it prefers a *question* over an acknowledgment. A question
 * invites the person to notice something themselves, which is the entire
 * point of the product; an acknowledgment only tells them what the app
 * already knows. The question never evaluates — "¿cómo se sostuvo?" has no
 * wrong answer, and no answer at all is also fine.
 */
export function getTodayInsight(
  day: Day,
  habits: Habit[],
  now: Date = new Date(),
  history: Day[] = [],
): Insight | null {
  const completedHabits = getCompletedHabitsToday(day, habits);
  const hasIntention = day.intention.trim().length > 0;
  const hasJournal = getJournalStatusToday(day);
  const hasClosing = getClosingReflectionStatusToday(day);
  const timeOfDay = getTimeOfDay(now);
  const somethingToday =
    hasIntention || hasJournal || hasClosing || completedHabits.length > 0;

  // Someone comes back after a hard stretch and the app greets them exactly
  // as if they'd never left. That isn't restraint, it's absence — a friend
  // who says nothing when you reappear after a month isn't being
  // respectful. So: a welcome, once, before they've done anything today.
  //
  // What it deliberately does NOT do: name the number of days, ask where
  // they were, or imply anything is owed. It notices; it doesn't audit.
  if (!somethingToday && isReturningAfterAbsence(day.date, history)) {
    return {
      id: "welcome-back",
      message: "Qué bueno tenerte de vuelta. Empezamos desde aquí.",
    };
  }

  if (timeOfDay === "evening" && !hasClosing) {
    // The day is ending and there is something from this morning to look
    // back at — the most useful thing the app can do is point at it.
    if (hasIntention) {
      return {
        id: "evening-intention-question",
        message: "Esta mañana dejaste una intención. ¿Cómo se sostuvo?",
      };
    }

    if (completedHabits.length > 0) {
      return {
        id: "evening-sustained-question",
        message: `Hoy sostuviste ${joinNaturally(
          completedHabits.map((habit) => habit.title),
        )}. ¿Qué te deja este día?`,
      };
    }

    if (hasJournal) {
      return {
        id: "evening-journal-question",
        message: "Hoy escribiste algo. ¿Queda algo más por decir antes de cerrar?",
      };
    }
  }

  if (completedHabits.length > 0) {
    return {
      id: "habits-completed-today",
      message: `Hoy ya sostuviste ${joinNaturally(
        completedHabits.map((habit) => habit.title),
      )}.`,
    };
  }

  if (hasJournal) {
    return {
      id: "journal-written-today",
      message: "Hoy ya dedicaste un momento para escribir.",
    };
  }

  if (hasClosing) {
    return {
      id: "closing-reflection-today",
      message: "Hoy ya cerraste este día con una reflexión.",
    };
  }

  if (hasIntention) {
    return {
      id: "intention-set-today",
      message: "Hoy ya dejaste clara tu intención. Con eso basta para empezar.",
    };
  }

  return null;
}
