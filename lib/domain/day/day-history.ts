import type { Day } from "./day";
import type { JournalEntry } from "@/lib/domain/entry/entry";
import type { JournalNote } from "@/lib/domain/journal/journal";

/**
 * Reading back what was written, as opposed to writing it.
 *
 * Kept apart from `day-journal.ts` for the same reason `archive.ts` is kept
 * apart: everything here is a pure function of what it is handed, importing
 * only types, so it can be tested without a Supabase client existing. The
 * saving side reaches for the store; this side never does.
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

/**
 * Every day's notes, built in one pass.
 *
 * This replaced a per-day reader that scanned the entire note store to
 * answer about one day. Asking it once per day is days × notes, so after
 * five years of daily writing the history tab did several million string
 * comparisons before it could draw anything — and it did that work twice,
 * once in the view and once again in the module.
 *
 * Grouping once costs a single pass and makes every day's lookup free. The
 * old reader is deleted rather than kept for convenience: it is the exact
 * shape that reintroduces the problem.
 */
export function groupJournalNotesByDayKey(
  notes: readonly JournalNote[],
): Map<string, JournalEntry[]> {
  const byDayKey = new Map<string, JournalEntry[]>();

  for (const note of notes) {
    const existing = byDayKey.get(note.dayKey);

    if (existing) {
      existing.push(toJournalEntry(note));
    } else {
      byDayKey.set(note.dayKey, [toJournalEntry(note)]);
    }
  }

  // Oldest first within each day: the order they were written.
  for (const entries of byDayKey.values()) {
    entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  return byDayKey;
}

/** A day as the history tab shows it. */
export type JournalHistoryDay = {
  day: Day;
  notes: JournalEntry[];
};

/**
 * The history list, newest day first.
 *
 * Ordered by the date written rather than by when the record happened to be
 * created, so an archive read years later runs backwards through someone's
 * life in the order they lived it.
 */
export function buildJournalHistory(
  days: readonly Day[],
  notesByDayKey: ReadonlyMap<string, JournalEntry[]>,
): JournalHistoryDay[] {
  return days
    .map((day) => ({ day, notes: notesByDayKey.get(day.date) ?? [] }))
    .filter((item) => item.notes.length > 0)
    .sort((left, right) => right.day.date.localeCompare(left.day.date));
}
