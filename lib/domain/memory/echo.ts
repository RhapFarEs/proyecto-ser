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
 * Below this, a memory is still recent enough to be remembered without help,
 * and returning it would be telling someone what they already know.
 *
 * Lowered from thirty. Thirty guaranteed a month of silence even when
 * something worth meeting again had been written on the second day, and the
 * first month is exactly when the product has nothing else to offer.
 *
 * Two weeks is set by forgetting, which is a fact about memory, and
 * deliberately not by any judgment of what the person wrote. A floor used as
 * a proxy for "important enough to come back" would be a verdict on their
 * writing — see the return-modes principle in CONSTITUTION.md.
 */
const MIN_AGE_DAYS = 14;

/**
 * Shorter than this and there isn't enough there to meet again. "Descansar"
 * is a fine intention and a poor echo.
 */
const MIN_TEXT_LENGTH = 12;

/**
 * Roughly one ordinary echo a week. Rarity is the whole design: something
 * that happens every morning is a feature, and people stop seeing features.
 * Anniversaries ignore this — those earn their own day.
 *
 * Counted from the day the person started writing, not from the calendar.
 * See `isEchoDay`.
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
 * A total order over candidates, independent of how storage returned them.
 *
 * `pickStable` indexes into this array, and the array used to arrive in
 * whatever order the stores happened to yield — newest first, which changes
 * the moment anything new is written. So the "same echo all day" guarantee
 * below did not actually hold: writing a note in the afternoon could silently
 * swap the morning's echo for a different one.
 *
 * Sorting by date then id makes the order a property of the data rather than
 * of the query. Ids are unique, so the order is total and there are no ties
 * left to break.
 */
function inStableOrder(candidates: EchoSource[]): EchoSource[] {
  return [...candidates].sort((left, right) => {
    const byDate = left.dateKey.localeCompare(right.dateKey);

    return byDate !== 0 ? byDate : left.id.localeCompare(right.id);
  });
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

/**
 * Whether today falls on this person's echo rhythm.
 *
 * Measured from the day they started writing rather than from the calendar.
 * The previous version asked whether the day of the *year* was divisible by
 * seven, which made echo days fixed dates shared by everybody — so how long
 * someone waited for their first echo was decided by where in the calendar
 * they happened to arrive, not by when they started writing. Someone whose
 * first entry landed just after one of those dates could sit behind the gate
 * for another week with eligible material, and lowering the age floor did
 * nothing about it, because the floor and the gate are independent.
 *
 * Anchored to their first entry, the rhythm is theirs: the gate opens seven
 * days after they begin, and every seven days after that.
 */
function isEchoDay(todayKey: string, firstWrittenKey: string): boolean {
  return daysBetween(firstWrittenKey, todayKey) % ECHO_INTERVAL_DAYS === 0;
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

  // The rhythm is anchored to when this person started writing, so it is
  // taken from every source rather than only the eligible ones — otherwise
  // the anchor would jump forward as entries crossed the age floor, and the
  // cadence would drift under them. Sources cannot be backdated, so once
  // someone has written anything this value never moves again.
  const firstWritten = sources.reduce(
    (earliest, source) => (source.dateKey < earliest ? source.dateKey : earliest),
    sources[0].dateKey,
  );

  const chosen =
    anniversaries[0] ??
    (isEchoDay(todayKey, firstWritten) ? pickStable(inStableOrder(candidates), todayKey) : null);

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
