import { getAllDays } from "@/lib/domain/day/day-storage";
import type { JournalNote } from "./journal";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Normalizes one raw stored record to the current JournalNote shape —
 * same role as `migrateHabit` for Habit. Always rebuilds the object
 * field-by-field so a field added after some records were written gets
 * backfilled instead of silently staying `undefined`.
 */
export function migrateJournalNote(raw: unknown): JournalNote | null {
  if (!isRecord(raw)) {
    return null;
  }

  if (typeof raw.id !== "string" || typeof raw.dayKey !== "string") {
    return null;
  }

  return {
    id: raw.id,
    dayKey: raw.dayKey,
    mood: typeof raw.mood === "string" ? raw.mood : "",
    content: typeof raw.content === "string" ? raw.content : "",
    deletedAt: typeof raw.deletedAt === "string" ? raw.deletedAt : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
  };
}

/**
 * Journal is the one synced domain that didn't start as its own top-level
 * store — before this milestone, every note lived inside `Day.entries`
 * (see `lib/domain/day/day-journal.ts`'s previous implementation). This
 * reads through `getAllDays()` (which already runs Day's own normalization,
 * including the older single-slot-journal-to-multi-note migration) and
 * lifts every journal-type entry out into the new flat shape, preserving
 * its original `id`/`createdAt`/`updatedAt` untouched. `Day` itself is
 * never modified — the old entries are simply never read again once this
 * has run.
 */
export function importLegacyDayJournalNotes(): JournalNote[] {
  const notes: JournalNote[] = [];

  for (const day of getAllDays()) {
    for (const entry of day.entries) {
      if (entry.type !== "journal") {
        continue;
      }

      notes.push({
        id: entry.id,
        dayKey: day.date,
        mood: entry.mood,
        content: entry.content,
        deletedAt: null,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      });
    }
  }

  return notes;
}
