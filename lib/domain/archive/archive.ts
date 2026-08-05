import { formatDateKeyLongLabel } from "@/lib/date";
import type { Day } from "@/lib/domain/day/day";
import type { IntentionEntry, JournalEntry } from "@/lib/domain/entry/entry";
import type { JournalNote } from "@/lib/domain/journal/journal";
import type { Week } from "@/lib/domain/week/week";

/**
 * Everything a person has written, in a form they can read without us.
 *
 * CONSTITUTION.md, Fourth Law: their words leave whenever they want, in a
 * form that is still useful elsewhere, and leaving is never made difficult,
 * slow or lossy. Until now they could not leave at all, which made the
 * clearest promise in the document the one the product did not keep.
 *
 * Markdown rather than JSON. The law's emphasis is on *readable*, and a
 * person opening this file in five years should find their life in it, not a
 * data structure. A machine-readable export can be added when something
 * actually needs to consume one; two formats maintained for a hypothetical
 * consumer is the addition this project keeps declining to make.
 *
 * Deleted entries are not included. A tombstone means the person removed
 * something on purpose, and handing it back in an export would undo a
 * decision that was theirs to make.
 */
export type ArchiveEntryKind = "intention" | "note" | "reflection" | "weekly";

export interface ArchiveEntry {
  readonly dateKey: string;
  readonly kind: ArchiveEntryKind;
  readonly text: string;
  /** Only journal notes carry one, and only when the person chose one. */
  readonly mood?: string;
}

export interface ArchiveDirectionRevision {
  readonly statement: string;
  readonly dateKey: string;
  readonly atmosphere: string | null;
}

/** Life areas and practices share a shape: a name, and why it matters. */
export interface ArchiveNamed {
  readonly title: string;
  readonly note: string;
}

export interface Archive {
  readonly displayName: string;
  readonly startedAt: string | null;
  readonly exportedAt: string;
  readonly entries: readonly ArchiveEntry[];
  /** Newest first — the current statement, then what came before it. */
  readonly direction: readonly ArchiveDirectionRevision[];
  readonly lifeAreas: readonly ArchiveNamed[];
  readonly practices: readonly ArchiveNamed[];
}

function hasText(value: string | undefined | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * The id `migrateDay` mints when it copies a flat legacy field into
 * `day.entries`.
 *
 * `createJournalEntry` and `createIntentionEntry` have exactly one caller
 * each, both inside that migration, so a record carrying this id *is* a copy
 * of the corresponding flat field — provenance by construction rather than a
 * guess from similar-looking text. A record of the same type without this id
 * has no known source, so it is treated as a writing in its own right.
 */
function promotedId(dateKey: string, kind: "journal" | "intention"): string {
  return `${dateKey}:${kind}`;
}

/**
 * Exact equality on trimmed text, and deliberately nothing cleverer.
 *
 * Two records are only ever collapsed when one was provably copied from the
 * other, and then only when the copy still says the same thing. Fuzzy
 * matching would eventually merge two things a person genuinely wrote twice,
 * and a merge cannot be undone by whoever reads the archive later.
 */
function sameText(value: string, other: string | undefined): boolean {
  return other !== undefined && value.trim() === other.trim();
}

/**
 * Everything a person wrote, gathered out of the shapes it is stored in.
 *
 * Pure, and separated from the storage reads on purpose. This is the part of
 * the export with actual reasoning in it — words are spread across more
 * places than the current screens suggest, and an export that missed one
 * would be silently lossy in the one feature whose entire job is not being
 * lossy. It only reads types, so no store is pulled in and every branch is
 * reachable from a test.
 *
 * Notes moved to their own store, but `day.entries` still holds journal
 * entries written before that move, the day's closing reflection — a live
 * feature, not legacy — and intentions from before `day.intention` existed.
 * Older still, `day.journal` was one flat `{ mood, entry, closing }` per day.
 *
 * This matters beyond completeness: ROADMAP.md P1.1 resolves those legacy
 * fields, and this function is the safety net that has to be correct before
 * anything starts removing them.
 */
export function collectArchiveEntries(
  days: readonly Day[],
  notes: readonly JournalNote[],
  weeks: readonly Week[],
): ArchiveEntry[] {
  const entries: ArchiveEntry[] = [];

  for (const day of days) {
    const promotedJournal = day.entries.find(
      (entry): entry is JournalEntry =>
        entry.type === "journal" && entry.id === promotedId(day.date, "journal"),
    );
    const promotedIntention = day.entries.find(
      (entry): entry is IntentionEntry =>
        entry.type === "intention" && entry.id === promotedId(day.date, "intention"),
    );

    // The promoted record first, because it is the richer of the pair: it
    // carries the closing reflection that the flat field holds separately,
    // and `closingReflection` was previously read by nothing at all.
    if (promotedIntention && hasText(promotedIntention.content)) {
      entries.push({ dateKey: day.date, kind: "intention", text: promotedIntention.content });
    }

    if (hasText(day.intention) && !sameText(day.intention, promotedIntention?.content)) {
      entries.push({ dateKey: day.date, kind: "intention", text: day.intention });
    }

    if (promotedJournal) {
      if (hasText(promotedJournal.content)) {
        entries.push({
          dateKey: day.date,
          kind: "note",
          text: promotedJournal.content,
          ...(hasText(promotedJournal.mood) ? { mood: promotedJournal.mood } : {}),
        });
      }

      if (hasText(promotedJournal.closingReflection)) {
        entries.push({
          dateKey: day.date,
          kind: "reflection",
          text: promotedJournal.closingReflection,
        });
      }
    }

    if (hasText(day.journal?.entry) && !sameText(day.journal.entry, promotedJournal?.content)) {
      entries.push({
        dateKey: day.date,
        kind: "note",
        text: day.journal.entry,
        ...(hasText(day.journal.mood) ? { mood: day.journal.mood } : {}),
      });
    }

    if (
      hasText(day.journal?.closing) &&
      !sameText(day.journal.closing, promotedJournal?.closingReflection)
    ) {
      entries.push({ dateKey: day.date, kind: "reflection", text: day.journal.closing });
    }

    for (const entry of day.entries) {
      // Already emitted above, paired with the flat field it was copied from.
      if (entry === promotedJournal || entry === promotedIntention) {
        continue;
      }

      // A journal or intention record that does not carry the promotion id
      // has no known source to be a copy of, so it stands on its own.
      if (entry.type === "journal" && hasText(entry.content)) {
        entries.push({
          dateKey: day.date,
          kind: "note",
          text: entry.content,
          ...(hasText(entry.mood) ? { mood: entry.mood } : {}),
        });
      }

      // Never a promotion: closing reflections come from the live feature in
      // `day-reflection.ts`, so one is always a separate writing from
      // `day.journal.closing` even when the text happens to match.
      if (entry.type === "reflection" && hasText(entry.content)) {
        entries.push({ dateKey: day.date, kind: "reflection", text: entry.content });
      }

      if (entry.type === "intention" && hasText(entry.content)) {
        entries.push({ dateKey: day.date, kind: "intention", text: entry.content });
      }
    }
  }

  for (const note of notes) {
    if (hasText(note.content)) {
      entries.push({
        dateKey: note.dayKey,
        kind: "note",
        text: note.content,
        ...(hasText(note.mood) ? { mood: note.mood } : {}),
      });
    }
  }

  for (const week of weeks) {
    // Three answers that only mean anything together, kept with the questions
    // actually asked on screen so the document reads back the conversation
    // the person had rather than a paraphrase of it.
    const parts: string[] = [];

    if (hasText(week.reflection.wentWell)) {
      parts.push(`Qué estuvo bien:\n${week.reflection.wentWell.trim()}`);
    }

    if (hasText(week.reflection.difficult)) {
      parts.push(`Qué fue difícil:\n${week.reflection.difficult.trim()}`);
    }

    if (hasText(week.reflection.nextWeekFocus)) {
      parts.push(`Hacia la siguiente semana:\n${week.reflection.nextWeekFocus.trim()}`);
    }

    if (parts.length > 0) {
      entries.push({ dateKey: week.id, kind: "weekly", text: parts.join("\n\n") });
    }
  }

  return entries;
}

export const KIND_LABEL: Record<ArchiveEntryKind, string> = {
  intention: "Intención",
  note: "Nota",
  reflection: "Cierre del día",
  weekly: "Revisión de la semana",
};

/**
 * Kinds in the order they happened within a day: the intention comes first
 * because it was written first, and the day closes with its reflection.
 */
const KIND_ORDER: ArchiveEntryKind[] = ["intention", "note", "reflection", "weekly"];

function byDateThenKind(left: ArchiveEntry, right: ArchiveEntry): number {
  const byDate = left.dateKey.localeCompare(right.dateKey);

  if (byDate !== 0) {
    return byDate;
  }

  return KIND_ORDER.indexOf(left.kind) - KIND_ORDER.indexOf(right.kind);
}

/** Markdown block quotes, so a multi-line entry stays one entry when read. */
function quote(text: string): string {
  return text
    .trim()
    .split("\n")
    .map((line) => `> ${line}`.trimEnd())
    .join("\n");
}

function entryHeading(entry: ArchiveEntry): string {
  const label = KIND_LABEL[entry.kind];

  return entry.mood ? `**${label}** · ${entry.mood}` : `**${label}**`;
}

/**
 * Chronological, oldest first — a life reads forward.
 *
 * Grouping by feature instead would shape the document like the app's menus
 * rather than like the person's years, and the app is the part of this that
 * is not meant to last.
 */
function writtenSection(entries: readonly ArchiveEntry[]): string[] {
  if (entries.length === 0) {
    return ["## Lo que escribiste", "", "Todavía no hay nada aquí.", ""];
  }

  const lines = ["## Lo que escribiste", ""];
  let currentDate = "";

  for (const entry of [...entries].sort(byDateThenKind)) {
    if (entry.dateKey !== currentDate) {
      currentDate = entry.dateKey;
      lines.push(`### ${formatDateKeyLongLabel(currentDate)}`, "");
    }

    lines.push(entryHeading(entry), "", quote(entry.text), "");
  }

  return lines;
}

/**
 * The date, and the room they were sitting in when they wrote it.
 *
 * The atmosphere was already being collected and then dropped on the floor
 * here, which is worse than not collecting it: where a person was is part of
 * what they wrote, and it is the one detail in the record that cannot be
 * reconstructed from anything else.
 */
function attribution(revision: ArchiveDirectionRevision): string {
  const date = formatDateKeyLongLabel(revision.dateKey);

  return revision.atmosphere ? `*${date} · ${revision.atmosphere}*` : `*${date}*`;
}

function directionSection(revisions: readonly ArchiveDirectionRevision[]): string[] {
  if (revisions.length === 0) {
    return [];
  }

  const [current, ...earlier] = revisions;
  const lines = ["## Tu dirección", "", quote(current.statement), "", attribution(current), ""];

  if (earlier.length > 0) {
    lines.push("### Lo que escribiste antes", "");

    for (const revision of earlier) {
      lines.push(quote(revision.statement), "", attribution(revision), "");
    }
  }

  return lines;
}

function namedSection(title: string, items: readonly ArchiveNamed[]): string[] {
  if (items.length === 0) {
    return [];
  }

  const lines = [`## ${title}`, ""];

  for (const item of items) {
    lines.push(`### ${item.title}`, "");

    if (item.note.trim().length > 0) {
      lines.push(quote(item.note), "");
    }
  }

  return lines;
}

/**
 * Builds the whole document. Pure: same archive in, same bytes out, with no
 * clock and no storage — the exported date is part of the archive it is
 * handed, so this can be tested without freezing time.
 */
export function buildArchiveDocument(archive: Archive): string {
  const heading = archive.displayName.trim().length > 0 ? `El archivo de ${archive.displayName.trim()}` : "Tu archivo";

  const lines = [
    `# ${heading}`,
    "",
    "Todo lo que has escrito en Proyecto SER, en tus propias palabras.",
    "",
    `Exportado el ${formatDateKeyLongLabel(archive.exportedAt)}.`,
  ];

  if (archive.startedAt) {
    lines.push(`Escribiendo aquí desde el ${formatDateKeyLongLabel(archive.startedAt)}.`);
  }

  lines.push(
    "",
    "Este documento es tuyo. No necesitas Proyecto SER para leerlo, y nada de",
    "lo que hay aquí depende de que la aplicación siga existiendo.",
    "",
    "---",
    "",
    ...writtenSection(archive.entries),
    ...directionSection(archive.direction),
    ...namedSection("Áreas de vida", archive.lifeAreas),
    ...namedSection("Prácticas", archive.practices),
  );

  // Exactly one trailing newline, so the file ends the way every other text
  // file does and diffs against a later export stay clean.
  return `${lines.join("\n").trimEnd()}\n`;
}
