import type { Day } from "./day";
import { saveJournalNote } from "@/lib/domain/journal/journal-storage";

/*
  Notes live in their own cloud-synced store (`lib/domain/journal`), not in
  `day.entries`. The functions here are the same-named, same-signature
  adapters the rest of the app already called, so no UI component needed to
  change when the storage moved.

  Reading them back belongs in `day-history.ts`, which stays pure. Editing,
  deleting and restoring live in the note store, because they are identified
  by note id and have nothing to do with a day — only writing a new note
  needs to know which day it belongs to.
*/

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
