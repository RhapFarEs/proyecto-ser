import storage from "@/lib/storage/storage";
import { createDay, type Day } from "./day";
import { mergeDays, migrateDay } from "./day-migrations";

export const DAY_STORAGE_KEY = "ser.days";

// Normalizes every raw record to its canonical YYYY-MM-DD key, merging any
// legacy-keyed and canonical-keyed records that resolve to the same
// calendar day (see `mergeDays` for the merge rule). If normalization
// changes anything, the result is persisted immediately so the raw store
// converges to the canonical shape after the first read post-migration,
// instead of re-deriving it on every read indefinitely.
function getDaysStore(): Record<string, Day> {
  const storedValue = storage.get<Record<string, unknown>>(DAY_STORAGE_KEY, {});

  if (!storedValue || typeof storedValue !== "object") {
    return {};
  }

  const referenceDate = new Date();
  const normalized: Record<string, Day> = {};
  let needsPersist = false;

  for (const [rawKey, rawEntry] of Object.entries(storedValue)) {
    const { day, canonicalKey } = migrateDay(rawKey, rawEntry, referenceDate);

    if (canonicalKey !== rawKey) {
      needsPersist = true;
    }

    const existing = normalized[canonicalKey];

    if (existing) {
      normalized[canonicalKey] = mergeDays(existing, day);
      needsPersist = true;
    } else {
      normalized[canonicalKey] = day;
    }
  }

  if (needsPersist) {
    storage.set(DAY_STORAGE_KEY, normalized);
  }

  return normalized;
}

export function getDay(date: string): Day {
  const days = getDaysStore();
  const storedDay = days[date];

  if (storedDay) {
    return storedDay;
  }

  return createDay(date);
}

export function getAllDays(): Day[] {
  return Object.values(getDaysStore()).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

export function setDay(day: Day): void {
  const days = getDaysStore();
  days[day.date] = day;
  storage.set(DAY_STORAGE_KEY, days);
}

export function updateDay(date: string, updater: (day: Day) => Day): Day {
  const current = getDay(date);
  const next = updater(current);
  setDay(next);
  return next;
}

export function removeDay(date: string): void {
  const days = getDaysStore();
  delete days[date];
  storage.set(DAY_STORAGE_KEY, days);
}

export function clearDayStorage(): void {
  storage.remove(DAY_STORAGE_KEY);
}
