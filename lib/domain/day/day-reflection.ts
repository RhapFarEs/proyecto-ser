import type { Day } from "./day";
import { createReflectionEntry, type ReflectionEntry } from "@/lib/domain/entry/entry";

function buildReflectionEntryId(date: string): string {
  return `${date}:reflection`;
}

function findReflectionEntry(day: Day): ReflectionEntry | undefined {
  return day.entries.find(
    (entry): entry is ReflectionEntry => entry.type === "reflection",
  );
}

export function getClosingReflection(day: Day): string {
  return findReflectionEntry(day)?.content ?? "";
}

export function hasClosingReflection(day: Day): boolean {
  return getClosingReflection(day).trim().length > 0;
}

export function setClosingReflection(day: Day, content: string): Day {
  const existing = findReflectionEntry(day);

  if (existing) {
    const updated: ReflectionEntry = {
      ...existing,
      content,
      updatedAt: new Date().toISOString(),
    };

    return {
      ...day,
      entries: day.entries.map((entry) =>
        entry.id === existing.id ? updated : entry,
      ),
    };
  }

  const created = createReflectionEntry(buildReflectionEntryId(day.date), content);

  return { ...day, entries: [...day.entries, created] };
}
