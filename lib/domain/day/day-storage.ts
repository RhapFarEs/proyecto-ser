import storage from "@/lib/storage/storage";
import { createSyncedStore } from "@/lib/sync/createSyncedStore";
import { createDay, type Day } from "./day";
import { mergeDays, migrateDay, normalizeDay } from "./day-migrations";
import type { Entry } from "@/lib/domain/entry/entry";

export const DAY_STORAGE_KEY = "ser.days";

interface DayRow {
  id: string;
  user_id: string;
  date: string;
  entries: Entry[];
  journal: Day["journal"];
  rituals: Day["rituals"];
  intention: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: DayRow): Day {
  return {
    id: row.id,
    date: row.date,
    entries: row.entries,
    journal: row.journal,
    rituals: row.rituals,
    intention: row.intention,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(day: Day, userId: string): DayRow {
  return {
    id: day.id,
    user_id: userId,
    date: day.date,
    entries: day.entries,
    journal: day.journal,
    rituals: day.rituals,
    intention: day.intention,
    deleted_at: day.deletedAt,
    created_at: day.createdAt,
    updated_at: day.updatedAt,
  };
}

/**
 * Day follows the same `createSyncedStore` wiring as Habit and Journal —
 * see `lib/domain/habit/habit-storage.ts` for the reference. Its `id` is
 * the calendar date key itself (not a random UUID), which is unique only
 * *within* one user's data, not globally — the `days` table's primary key
 * is `(id, user_id)` together, not `id` alone (see the migration SQL),
 * otherwise two different users' entries for the same calendar date would
 * collide.
 */
const store = createSyncedStore<Day, DayRow>({
  storageKey: DAY_STORAGE_KEY,
  table: "days",
  normalize: normalizeDay,
  fromRow,
  toRow,
});

export function getDay(date: string): Day {
  return store.getOne(date) ?? createDay(date);
}

/**
 * Preserves the historical sort — by calendar date, not by `createdAt`
 * (the two aren't guaranteed to agree, e.g. a day whose first write comes
 * from a retroactive edit) — `store.getAll()`'s own default sort is by
 * `createdAt`, so it's re-sorted here to keep this function's existing
 * contract unchanged for callers like JournalView's history list.
 */
export function getAllDays(): Day[] {
  return [...store.getAll()].sort((a, b) => b.date.localeCompare(a.date));
}

export function setDay(day: Day): void {
  store.save(day);
}

/**
 * Always succeeds, even for a date with no existing record — the exact
 * behavior every caller (TodayView, JournalView) already relies on for a
 * brand-new day. `store.update()` alone can't do this: it returns
 * `undefined` for an unknown id, since it assumes "update a thing that
 * doesn't exist" is a bug — not the normal first-write case Day has.
 */
export function updateDay(date: string, updater: (day: Day) => Day): Day {
  const current = getDay(date);
  const next: Day = { ...updater(current), updatedAt: new Date().toISOString() };
  store.save(next);
  return next;
}

export function setDaySyncUserId(userId: string | null): void {
  store.setUserId(userId);
}

export function pullDays(): Promise<void> {
  return store.pull();
}

/**
 * One-time legacy import: reads the flat pre-sync `ser.days` blob directly
 * (bypassing the synced store entirely) and runs it through the exact same
 * canonicalization + cross-key merge (`migrateDay`/`mergeDays`) the old
 * `getDaysStore()` used to run on every read — now run once, at migration
 * time, instead of on every load. This must finish reading the flat key
 * before any `store.*` call runs (the generic engine's own legacy-key
 * adoption deletes that flat key the first time it's touched) — see the
 * call order below and in `migrateDaysToCloud`.
 */
function importLegacyDays(): Day[] {
  const raw = storage.get<Record<string, unknown>>(DAY_STORAGE_KEY, {});

  if (!raw || typeof raw !== "object") {
    return [];
  }

  const referenceDate = new Date();
  const canonical: Record<string, Day> = {};

  for (const [rawKey, rawEntry] of Object.entries(raw)) {
    const { day, canonicalKey } = migrateDay(rawKey, rawEntry, referenceDate);
    const existing = canonical[canonicalKey];
    canonical[canonicalKey] = existing ? mergeDays(existing, day) : day;
  }

  return Object.values(canonical);
}

/**
 * Day is the domain other domains depend on (Journal's own migration reads
 * `getAllDays()`) — this must run, and must read the legacy flat key,
 * before any other domain's migration touches the day store. See the call
 * order in `lib/auth/AuthContext.tsx`.
 */
export async function migrateDaysToCloud(): Promise<void> {
  const legacyDays = importLegacyDays();

  for (const day of legacyDays) {
    store.save(day);
  }

  await store.runInitialMigration();
}
