import type { Day } from "./day";
import type { JournalEntry } from "@/lib/domain/entry/entry";
import { getJournalNotesForDayKey, saveJournalNote } from "@/lib/domain/journal/journal-storage";
import type { JournalNote } from "@/lib/domain/journal/journal";

// Extension point for a future Journey domain: a growing list of
// timestamped notes across many days is exactly the raw material a
// narrative/timeline view would read from.

/**
 * Notes now live in their own cloud-synced store (`lib/domain/journal`),
 * not in `day.entries` — this function and `addJournalNote` below are kept
 * as the same-named, same-signature adapter the rest of the app already
 * calls (JournalView, JournalHistoryModule), so no UI component needed to
 * change when the storage moved. `closingReflection` is always empty here:
 * it was never populated by the multi-note flow before this migration
 * either — see `lib/domain/day/day-reflection.ts` for the actual "closing
 * reflection" concept, which is unrelated and untouched.
 */
function toJournalEntry(note: JournalNote): JournalEntry {
  return {
    id: note.id,
    type: "journal",
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    mood: note.mood,
    content: note.content,
    closingReflection: "",
  };
}

/** All journal notes for a day, oldest first (the order they were written). */
export function getJournalNotesForDay(day: Day): JournalEntry[] {
  return getJournalNotesForDayKey(day.date)
    .map(toJournalEntry)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/**
 * Appends a new journal note — never overwrites a previous one. Notes are
 * independent entries, not a single per-day slot, so multiple can be saved
 * throughout the same day. Persists directly to the Journal store (memory
 * -> localStorage -> async cloud push); the returned `Day` is otherwise
 * unchanged; callers that route through `updateDay`/`setDay` (see
 * JournalView) just re-persist the same Day, which is harmless.
 */
export function addJournalNote(day: Day, mood: string, content: string): Day {
  saveJournalNote(day.date, mood, content);
  return { ...day };
}
