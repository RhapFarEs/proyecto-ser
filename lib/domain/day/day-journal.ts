import type { Day } from "./day";
import { createJournalEntry, type JournalEntry } from "@/lib/domain/entry/entry";

// Extension point for a future Journey domain: a growing list of
// timestamped notes across many days is exactly the raw material a
// narrative/timeline view would read from. No Journey concept exists yet —
// this file only appends and reads notes for a single Day.

function buildJournalNoteId(date: string): string {
  return `${date}:journal:${crypto.randomUUID()}`;
}

/** All journal notes for a day, oldest first (the order they were written). */
export function getJournalNotesForDay(day: Day): JournalEntry[] {
  return day.entries
    .filter((entry): entry is JournalEntry => entry.type === "journal")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/**
 * Appends a new journal note — never overwrites a previous one. Notes are
 * independent entries, not a single per-day slot, so multiple can be saved
 * throughout the same day.
 */
export function addJournalNote(day: Day, mood: string, content: string): Day {
  const note = createJournalEntry(buildJournalNoteId(day.date), mood, content, "");
  return { ...day, entries: [...day.entries, note] };
}
