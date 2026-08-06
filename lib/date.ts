export function getFormattedDate() {
  const today = new Date();

  return today.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Canonical, machine-readable identity for a calendar day: a local
 * YYYY-MM-DD key built from local date components (never `toISOString()`,
 * which converts to UTC first and can shift the date near midnight for
 * users outside UTC+0). This is the value Day.id/Day.date must use — never
 * a locale-formatted display string.
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses a canonical YYYY-MM-DD key back into a local Date for display
 * formatting. Never passed to `new Date(string)` directly — that parses
 * date-only ISO strings as UTC midnight, which can display as the wrong
 * day in negative UTC-offset timezones.
 */
export function parseLocalDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const DAY_KEY_LABEL_FORMAT = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** Formats a canonical date key as a human-facing label, at render time only. */
export function formatDateKeyLabel(key: string): string {
  return DAY_KEY_LABEL_FORMAT.format(parseLocalDateKey(key));
}

const DAY_KEY_LONG_LABEL_FORMAT = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Formats a canonical date key as a full prose date, e.g. "13 de julio de 2026". */
export function formatDateKeyLongLabel(key: string): string {
  return DAY_KEY_LONG_LABEL_FORMAT.format(parseLocalDateKey(key));
}

/** Shifts a canonical date key by a number of days (may be negative). */
export function addDaysToKey(key: string, days: number): string {
  const date = parseLocalDateKey(key);
  const shifted = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  return getLocalDateKey(shifted);
}

/**
 * Canonical key for the Monday that starts the week containing `date`
 * (Monday–Sunday boundary). `Date.getDay()` returns 0=Sunday..6=Saturday.
 */
export function getWeekStartKey(date: Date = new Date()): string {
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + diffToMonday);
  return getLocalDateKey(monday);
}

/** The seven canonical day keys (Monday–Sunday) belonging to the week starting at `weekStartKey`. */
export function getWeekDayKeys(weekStartKey: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDaysToKey(weekStartKey, index));
}

/** The JS weekday index (0=Sunday..6=Saturday) for a canonical date key. */
export function getWeekdayOfKey(key: string): number {
  return parseLocalDateKey(key).getDay();
}

/**
 * How long until the local day changes, in milliseconds.
 *
 * A second past midnight rather than exactly on it: waking on the boundary
 * can still read the previous date on a clock that has not quite ticked
 * over, and a second late is invisible where a day early is a misfiled note.
 *
 * Always positive, so a caller that reschedules itself can never spin.
 */
export function millisecondsUntilNextDay(now: Date = new Date()): number {
  const nextDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    1,
    0,
  );

  return nextDay.getTime() - now.getTime();
}