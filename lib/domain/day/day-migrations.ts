import { createDay, type Day } from "./day";
import { getLocalDateKey } from "@/lib/date";
import {
  createIntentionEntry,
  createJournalEntry,
  createRitualEntry,
  type Entry,
  type IntentionEntry,
  type JournalEntry,
  type RitualEntry,
} from "@/lib/domain/entry/entry";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getStringField(
  source: Record<string, unknown> | undefined,
  key: string,
  fallback: string,
): string {
  const value = source?.[key];
  return typeof value === "string" ? value : fallback;
}

function hasEntries(day: Record<string, unknown>): day is Record<string, unknown> & { entries: unknown[] } {
  return Array.isArray(day.entries);
}

const CANONICAL_DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isCanonicalDateKey(value: string): boolean {
  return CANONICAL_DATE_KEY_PATTERN.test(value);
}

// Reverse lookup for the legacy display string produced by
// `getFormattedDate()` (`toLocaleDateString("es-MX", { weekday: "long", day:
// "numeric", month: "long" })`), e.g. "sábado, 11 de julio" — a format that
// never captured a year.
const LEGACY_WEEKDAY_NAMES_ES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

const LEGACY_MONTH_NAMES_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

type LegacySpanishDateParts = { weekday: number; month: number; day: number };

function parseLegacySpanishDate(value: string): LegacySpanishDateParts | null {
  const match = value.trim().match(/^([a-záéíóúñ]+),\s*(\d{1,2})\s+de\s+([a-záéíóúñ]+)$/i);

  if (!match) {
    return null;
  }

  const [, weekdayName, dayText, monthName] = match;
  const weekday = LEGACY_WEEKDAY_NAMES_ES.indexOf(weekdayName.toLowerCase());
  const month = LEGACY_MONTH_NAMES_ES.indexOf(monthName.toLowerCase());
  const day = Number(dayText);

  if (weekday === -1 || month === -1 || !Number.isFinite(day)) {
    return null;
  }

  return { weekday, month, day };
}

// The legacy format never stored a year, so it can't be parsed directly.
// Weekday + day + month only recurs on a specific year within any given
// short window, so we search backward from the reference year (most recent
// first) for the year where that day/month combination actually falls on
// the recorded weekday, and use that as the reconstructed year. Legacy
// records are assumed to be no more than 6 years old.
function resolveLegacyDateKey(value: string, referenceDate: Date): string | null {
  const parts = parseLegacySpanishDate(value);

  if (!parts) {
    return null;
  }

  const referenceYear = referenceDate.getFullYear();

  for (let offset = 0; offset <= 6; offset++) {
    const year = referenceYear - offset;
    const candidate = new Date(year, parts.month, parts.day);

    if (candidate.getMonth() === parts.month && candidate.getDay() === parts.weekday) {
      return getLocalDateKey(candidate);
    }
  }

  return null;
}

function resolveCanonicalDateKey(rawKey: string, dateField: unknown, referenceDate: Date): string {
  const candidate = typeof dateField === "string" && dateField.trim() ? dateField : rawKey;

  if (isCanonicalDateKey(candidate)) {
    return candidate;
  }

  return resolveLegacyDateKey(candidate, referenceDate) ?? candidate;
}

function rewriteEntryId(id: string, oldPrefix: string, newPrefix: string): string {
  if (oldPrefix === newPrefix) {
    return id;
  }

  const marker = `${oldPrefix}:`;
  return id.startsWith(marker) ? `${newPrefix}:${id.slice(marker.length)}` : id;
}

function migrateJournalEntry(day: Record<string, unknown>, canonicalKey: string): JournalEntry | null {
  const journal = day.journal;
  const entryText = isRecord(journal) ? journal.entry : "";
  const mood = isRecord(journal) ? journal.mood : "";
  const closingReflection = isRecord(journal) ? journal.closing : "";

  if (typeof entryText !== "string" || !entryText.trim()) {
    return null;
  }

  return createJournalEntry(
    `${canonicalKey}:journal`,
    typeof mood === "string" ? mood : "calm",
    entryText,
    typeof closingReflection === "string" ? closingReflection : "",
  );
}

function migrateRitualEntries(day: Record<string, unknown>, canonicalKey: string): RitualEntry[] {
  const rituals = day.rituals;
  const checks = isRecord(rituals) ? rituals.checks : undefined;

  if (!Array.isArray(checks)) {
    return [];
  }

  return checks
    .map((checked, index) => ({ checked, index }))
    .filter((item) => item.checked)
    .map((item) =>
      createRitualEntry(`${canonicalKey}:ritual:${item.index}`, `ritual:${item.index}`, true),
    );
}

function migrateIntentionEntry(day: Record<string, unknown>, canonicalKey: string): IntentionEntry | null {
  const intention = day.intention;

  if (typeof intention !== "string" || !intention.trim()) {
    return null;
  }

  return createIntentionEntry(`${canonicalKey}:intention`, intention);
}

export interface MigratedDay {
  day: Day;
  canonicalKey: string;
}

/**
 * Normalizes one raw stored record to the canonical Day shape and resolves
 * its stable YYYY-MM-DD identity, reconstructing it from the legacy
 * locale-formatted date string if necessary. `rawKey` is the property key
 * the record was stored under (used as a fallback identity source and as
 * the "old" id prefix for rewriting deterministic entry ids).
 */
export function migrateDay(
  rawKey: string,
  rawValue: unknown,
  referenceDate: Date = new Date(),
): MigratedDay {
  if (!isRecord(rawValue)) {
    const canonicalKey = isCanonicalDateKey(rawKey)
      ? rawKey
      : resolveLegacyDateKey(rawKey, referenceDate) ?? getLocalDateKey(referenceDate);

    return { day: createDay(canonicalKey), canonicalKey };
  }

  const originalDateValue =
    typeof rawValue.date === "string" && rawValue.date.trim() ? rawValue.date : rawKey;
  const canonicalKey = resolveCanonicalDateKey(rawKey, rawValue.date, referenceDate);
  const baseDay = createDay(canonicalKey);

  const existingEntries: Entry[] = (hasEntries(rawValue)
    ? rawValue.entries.filter((entry): entry is Entry => isRecord(entry))
    : []
  ).map((entry) => ({
    ...entry,
    id: rewriteEntryId(entry.id, originalDateValue, canonicalKey),
  }));

  const entries = [...existingEntries];

  // Legacy fields can still receive new writes (e.g. the Journal flow) even
  // after `entries` already holds records from other sources (habits,
  // closing reflection), so each entry type is migrated independently the
  // first time it's missing, rather than skipping migration entirely once
  // any entry exists.
  if (!entries.some((entry) => entry.type === "journal")) {
    const journalEntry = migrateJournalEntry(rawValue, canonicalKey);
    if (journalEntry) {
      entries.push(journalEntry);
    }
  }

  if (!entries.some((entry) => entry.type === "ritual")) {
    entries.push(...migrateRitualEntries(rawValue, canonicalKey));
  }

  if (!entries.some((entry) => entry.type === "intention")) {
    const intentionEntry = migrateIntentionEntry(rawValue, canonicalKey);
    if (intentionEntry) {
      entries.push(intentionEntry);
    }
  }

  const journalSource = isRecord(rawValue.journal) ? rawValue.journal : undefined;

  const day = {
    ...baseDay,
    ...rawValue,
    id: canonicalKey,
    date: canonicalKey,
    entries,
    journal: {
      mood: getStringField(journalSource, "mood", "calm"),
      entry: getStringField(journalSource, "entry", ""),
      closing: getStringField(journalSource, "closing", ""),
    },
    rituals: {
      checks: Array.isArray((rawValue.rituals as Record<string, unknown> | undefined)?.checks)
        ? ((rawValue.rituals as Record<string, unknown>).checks as boolean[])
        : [],
    },
    intention: typeof rawValue.intention === "string" ? rawValue.intention : "",
  } as Day;

  return { day, canonicalKey };
}

/**
 * Merge rule for two raw records that resolve to the same canonical date
 * key (a legacy-keyed record and a canonical-keyed record created for the
 * same calendar day). `incoming` is treated as the chronologically newer
 * side — it can only exist if it was written after this migration shipped.
 *
 * - `entries`: union of both, de-duplicated by id; on a collision the entry
 *   with the later `updatedAt` wins.
 * - `journal` / `rituals` / `intention` (legacy draft mirrors): `incoming`'s
 *   value wins whenever it is non-default/non-empty; otherwise `base`'s
 *   value is kept, so a field only touched pre-migration isn't silently
 *   lost.
 */
export function mergeDays(base: Day, incoming: Day): Day {
  const entriesById = new Map<string, Entry>();

  for (const entry of base.entries) {
    entriesById.set(entry.id, entry);
  }

  for (const entry of incoming.entries) {
    const existing = entriesById.get(entry.id);
    if (!existing || entry.updatedAt >= existing.updatedAt) {
      entriesById.set(entry.id, entry);
    }
  }

  return {
    ...base,
    entries: Array.from(entriesById.values()),
    journal: {
      mood: incoming.journal.mood !== "calm" ? incoming.journal.mood : base.journal.mood,
      entry: incoming.journal.entry.trim() ? incoming.journal.entry : base.journal.entry,
      closing: incoming.journal.closing.trim() ? incoming.journal.closing : base.journal.closing,
    },
    rituals: {
      checks: incoming.rituals.checks.length > 0 ? incoming.rituals.checks : base.rituals.checks,
    },
    intention: incoming.intention.trim() ? incoming.intention : base.intention,
  };
}

/**
 * Normalizes one raw stored record already in the current Day shape — the
 * `createSyncedStore` `normalize` hook (same role as `migrateHabit` /
 * `migrateJournalNote`). Assumes a canonical key/id already: the legacy
 * key-format cleanup and cross-key merge (`migrateDay`/`mergeDays` above)
 * only ever run once, during the one-time cloud migration — see
 * `importLegacyDays` in `day-storage.ts`.
 */
export function normalizeDay(raw: unknown): Day | null {
  if (!isRecord(raw)) {
    return null;
  }

  if (typeof raw.id !== "string" || typeof raw.date !== "string") {
    return null;
  }

  const journalSource = isRecord(raw.journal) ? raw.journal : undefined;
  const ritualsSource = isRecord(raw.rituals) ? raw.rituals : undefined;
  const ritualChecks = ritualsSource?.checks;

  return {
    id: raw.id,
    date: raw.date,
    entries: Array.isArray(raw.entries)
      ? (raw.entries.filter(isRecord) as unknown as Entry[])
      : [],
    journal: {
      mood: getStringField(journalSource, "mood", "calm"),
      entry: getStringField(journalSource, "entry", ""),
      closing: getStringField(journalSource, "closing", ""),
    },
    rituals: {
      checks: Array.isArray(ritualChecks) ? (ritualChecks as boolean[]) : [],
    },
    intention: typeof raw.intention === "string" ? raw.intention : "",
    deletedAt: typeof raw.deletedAt === "string" ? raw.deletedAt : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
  };
}
