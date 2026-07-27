import { getLocalDateKey, parseLocalDateKey } from "@/lib/date";

/**
 * An echo is something the person wrote long enough ago to have forgotten,
 * handed back to them verbatim, with no comment attached.
 *
 * This is the one place where Proyecto SER does something a person could
 * call intelligence, so it is worth being exact about what the intelligence
 * *is*. It is not generation — the product never writes a word on someone's
 * behalf, and nothing anyone writes here is ever sent anywhere to be
 * interpreted. The judgment is entirely in **when to speak and when to stay
 * quiet**: what counts as old enough to have faded, what is substantial
 * enough to be worth returning, and how rarely this may happen before it
 * stops being a moment and becomes furniture.
 *
 * What it must never do is editorialize. "Mira cuánto has cambiado" turns a
 * memory into a verdict, and the person is the only one entitled to reach
 * one. The echo presents the words and the date, and then it stops talking.
 */
export interface Echo {
  id: string;
  /** The person's own words, exactly as they wrote them. */
  text: string;
  /** The day the words were written. */
  dateKey: string;
  /** Full years between then and today — 0 for anything under a year. */
  yearsAgo: number;
  /**
   * `anniversary` when today is the same calendar day, some year later.
   * `recollection` for the ordinary case: something old, resurfacing.
   */
  kind: "anniversary" | "recollection";
}

/** Anything written by a person, with the day they wrote it. */
export interface EchoSource {
  id: string;
  dateKey: string;
  text: string;
}

/**
 * Below this, a memory is still recent enough to be remembered without
 * help, and returning it would be telling someone what they already know.
 */
const MIN_AGE_DAYS = 30;

/**
 * Shorter than this and there isn't enough there to meet again. "Descansar"
 * is a fine intention and a poor echo.
 */
const MIN_TEXT_LENGTH = 12;

/**
 * Roughly one ordinary echo a week. Rarity is the whole design: something
 * that happens every morning is a feature, and people stop seeing features.
 * Anniversaries ignore this — those earn their own day.
 */
const ECHO_INTERVAL_DAYS = 7;

function daysBetween(fromKey: string, toKey: string): number {
  return Math.round(
    (parseLocalDateKey(toKey).getTime() - parseLocalDateKey(fromKey).getTime()) / 86_400_000,
  );
}

function dayOfYear(date: Date): number {
  return Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
}

/** Same month and day, an earlier year. */
function isSameCalendarDay(pastKey: string, todayKey: string): boolean {
  const past = parseLocalDateKey(pastKey);
  const today = parseLocalDateKey(todayKey);

  return (
    past.getMonth() === today.getMonth() &&
    past.getDate() === today.getDate() &&
    past.getFullYear() < today.getFullYear()
  );
}

function fullYearsBetween(pastKey: string, todayKey: string): number {
  return Math.floor(daysBetween(pastKey, todayKey) / 365);
}

/**
 * Deterministic per calendar day: the same echo all day, and never a
 * different one for pulling to refresh. A memory that reshuffles on demand
 * is a slot machine, which is the opposite of this product.
 */
function pickStable<T>(items: T[], todayKey: string): T {
  const today = parseLocalDateKey(todayKey);
  const seed = today.getFullYear() * 1000 + dayOfYear(today);

  return items[seed % items.length];
}

function isEchoDay(todayKey: string): boolean {
  return dayOfYear(parseLocalDateKey(todayKey)) % ECHO_INTERVAL_DAYS === 0;
}

/**
 * Chooses at most one echo for today, or nothing at all — which is the
 * usual answer, and is meant to be.
 *
 * An exact anniversary always wins: the same calendar day, a year or more
 * later, is the rarest coincidence this product can notice, and noticing it
 * is worth more than any line the app could compose. Otherwise an ordinary
 * echo surfaces about once a week, chosen from anything old enough and
 * substantial enough to have faded.
 */
export function selectEcho(
  sources: EchoSource[],
  todayKey: string = getLocalDateKey(),
): Echo | null {
  const candidates = sources.filter((source) => {
    const text = source.text.trim();

    return (
      text.length >= MIN_TEXT_LENGTH &&
      source.dateKey < todayKey &&
      daysBetween(source.dateKey, todayKey) >= MIN_AGE_DAYS
    );
  });

  if (candidates.length === 0) {
    return null;
  }

  const anniversaries = candidates
    .filter((candidate) => isSameCalendarDay(candidate.dateKey, todayKey))
    // Most recent first: "hace un año" over "hace cuatro" when both exist,
    // because the nearer one is the one still close enough to feel.
    .sort((left, right) => right.dateKey.localeCompare(left.dateKey));

  const chosen = anniversaries[0] ?? (isEchoDay(todayKey) ? pickStable(candidates, todayKey) : null);

  if (!chosen) {
    return null;
  }

  return {
    id: chosen.id,
    text: chosen.text.trim(),
    dateKey: chosen.dateKey,
    yearsAgo: fullYearsBetween(chosen.dateKey, todayKey),
    kind: anniversaries[0] ? "anniversary" : "recollection",
  };
}
