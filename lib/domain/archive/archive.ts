import { formatDateKeyLongLabel } from "@/lib/date";

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

const KIND_LABEL: Record<ArchiveEntryKind, string> = {
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

function directionSection(revisions: readonly ArchiveDirectionRevision[]): string[] {
  if (revisions.length === 0) {
    return [];
  }

  const [current, ...earlier] = revisions;
  const lines = ["## Tu dirección", "", quote(current.statement), ""];

  lines.push(`*${formatDateKeyLongLabel(current.dateKey)}*`, "");

  if (earlier.length > 0) {
    lines.push("### Lo que escribiste antes", "");

    for (const revision of earlier) {
      lines.push(quote(revision.statement), "", `*${formatDateKeyLongLabel(revision.dateKey)}*`, "");
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
