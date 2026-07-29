import { getLocalDateKey } from "@/lib/date";
import { getAllDays } from "@/lib/domain/day/day-storage";
import { getJournalNotes } from "@/lib/domain/journal/journal-storage";
import { getWeeks } from "@/lib/domain/week/week-storage";
import { getHabits } from "@/lib/domain/habit/habit-storage";
import { getLifeAreas } from "@/lib/domain/life-area/life-area-storage";
import {
  getDirectionHistory,
  getLifeDirection,
} from "@/lib/domain/direction/direction-storage";
import type { Archive, ArchiveEntry, ArchiveNamed } from "./archive";

function hasText(value: string | undefined | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Words a person wrote are spread across more places than the current
 * screens suggest, and an export that only read the current ones would be
 * quietly lossy.
 *
 * Notes moved to their own store, but `day.entries` still holds journal
 * entries written before that move, along with the day's closing reflection
 * — which is a live feature, not legacy — and intentions from before
 * `day.intention` existed. Older still, `day.journal` was a single flat
 * `{ mood, entry, closing }` per day.
 *
 * All of it is read here. This matters beyond completeness: ROADMAP.md P1.1
 * resolves those legacy fields, and export is the safety net that has to
 * exist before anything starts removing them.
 */
function entriesFromDays(): ArchiveEntry[] {
  const entries: ArchiveEntry[] = [];

  for (const day of getAllDays()) {
    if (hasText(day.intention)) {
      entries.push({ dateKey: day.date, kind: "intention", text: day.intention });
    }

    if (hasText(day.journal?.entry)) {
      entries.push({
        dateKey: day.date,
        kind: "note",
        text: day.journal.entry,
        ...(hasText(day.journal.mood) ? { mood: day.journal.mood } : {}),
      });
    }

    if (hasText(day.journal?.closing)) {
      entries.push({ dateKey: day.date, kind: "reflection", text: day.journal.closing });
    }

    for (const entry of day.entries) {
      if (entry.type === "journal" && hasText(entry.content)) {
        entries.push({
          dateKey: day.date,
          kind: "note",
          text: entry.content,
          ...(hasText(entry.mood) ? { mood: entry.mood } : {}),
        });
      }

      if (entry.type === "reflection" && hasText(entry.content)) {
        entries.push({ dateKey: day.date, kind: "reflection", text: entry.content });
      }

      if (entry.type === "intention" && hasText(entry.content)) {
        entries.push({ dateKey: day.date, kind: "intention", text: entry.content });
      }
    }
  }

  return entries;
}

function entriesFromNotes(): ArchiveEntry[] {
  return getJournalNotes()
    .filter((note) => hasText(note.content))
    .map((note) => ({
      dateKey: note.dayKey,
      kind: "note" as const,
      text: note.content,
      ...(hasText(note.mood) ? { mood: note.mood } : {}),
    }));
}

/**
 * A week's reflection is three answers, and they only mean anything
 * together. Flattened into one passage with its questions kept, so the
 * document reads as something a person wrote rather than as three orphaned
 * fragments sharing a date.
 */
function entriesFromWeeks(): ArchiveEntry[] {
  const entries: ArchiveEntry[] = [];

  for (const week of getWeeks()) {
    const parts: string[] = [];

    if (hasText(week.reflection.wentWell)) {
      parts.push(`Lo que fue bien:\n${week.reflection.wentWell.trim()}`);
    }

    if (hasText(week.reflection.difficult)) {
      parts.push(`Lo que costó:\n${week.reflection.difficult.trim()}`);
    }

    if (hasText(week.reflection.nextWeekFocus)) {
      parts.push(`Hacia dónde la próxima semana:\n${week.reflection.nextWeekFocus.trim()}`);
    }

    if (parts.length > 0) {
      entries.push({ dateKey: week.id, kind: "weekly", text: parts.join("\n\n") });
    }
  }

  return entries;
}

function named(items: { title: string; note: string }[]): ArchiveNamed[] {
  return items.filter((item) => hasText(item.title));
}

/**
 * Reads every local store and hands the result to `buildArchiveDocument`.
 *
 * The clock and the person's own details are passed in rather than reached
 * for: the profile lives in auth state that this module has no business
 * knowing about, and injecting the export date keeps the document a pure
 * function of its input. Local reads only — an export must work offline,
 * because a record you can only retrieve with a network is not one you fully
 * hold.
 */
export function gatherArchive(
  person: { displayName: string; startedAt: string | null } | null,
  exportedAt: string,
): Archive {
  const current = getLifeDirection();
  const direction = current ? [current, ...getDirectionHistory()] : [];

  return {
    displayName: person?.displayName ?? "",
    startedAt: person?.startedAt ? getLocalDateKey(new Date(person.startedAt)) : null,
    exportedAt,
    entries: [...entriesFromDays(), ...entriesFromNotes(), ...entriesFromWeeks()],
    direction: direction.map((revision) => ({
      statement: revision.statement,
      dateKey: getLocalDateKey(new Date(revision.createdAt)),
      atmosphere: revision.atmosphere,
    })),
    lifeAreas: named(
      getLifeAreas().map((area) => ({ title: area.title, note: area.whyItMatters })),
    ),
    practices: named(getHabits().map((habit) => ({ title: habit.title, note: habit.purpose }))),
  };
}
