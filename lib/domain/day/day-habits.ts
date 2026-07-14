import type { Day } from "./day";
import { createHabitEntry, type HabitEntry } from "@/lib/domain/entry/entry";

function buildHabitEntryId(date: string, habitId: string): string {
  return `${date}:habit:${habitId}`;
}

export function isHabitCompleted(day: Day, habitId: string): boolean {
  return day.entries.some(
    (entry) => entry.type === "habit" && entry.habitId === habitId && entry.completed,
  );
}

export function setHabitCompletion(
  day: Day,
  habitId: string,
  completed: boolean,
): Day {
  const existing = day.entries.find(
    (entry): entry is HabitEntry =>
      entry.type === "habit" && entry.habitId === habitId,
  );

  if (existing) {
    const updated: HabitEntry = {
      ...existing,
      completed,
      updatedAt: new Date().toISOString(),
    };

    return {
      ...day,
      entries: day.entries.map((entry) =>
        entry.id === existing.id ? updated : entry,
      ),
    };
  }

  const created = createHabitEntry(
    buildHabitEntryId(day.date, habitId),
    habitId,
    completed,
  );

  return { ...day, entries: [...day.entries, created] };
}
