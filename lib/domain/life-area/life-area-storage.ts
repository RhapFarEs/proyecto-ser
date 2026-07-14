import { createSyncedStore } from "@/lib/sync/createSyncedStore";
import { type LifeArea } from "./life-area";
import { normalizeLifeArea } from "./life-area-migrations";

export const LIFE_AREA_STORAGE_KEY = "ser.life-areas";

interface LifeAreaRow {
  id: string;
  user_id: string;
  title: string;
  why_it_matters: string;
  active: boolean;
  in_focus: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: LifeAreaRow): LifeArea {
  return {
    id: row.id,
    title: row.title,
    whyItMatters: row.why_it_matters,
    active: row.active,
    inFocus: row.in_focus,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(area: LifeArea, userId: string): LifeAreaRow {
  return {
    id: area.id,
    user_id: userId,
    title: area.title,
    why_it_matters: area.whyItMatters,
    active: area.active,
    in_focus: area.inFocus,
    deleted_at: area.deletedAt,
    created_at: area.createdAt,
    updated_at: area.updatedAt,
  };
}

/**
 * Life Area follows the same `createSyncedStore` wiring as Habit/Journal —
 * see `lib/domain/habit/habit-storage.ts` for the reference. Unlike Day
 * and Week, `id` here is a `crypto.randomUUID()` (see `createLifeArea`),
 * globally unique regardless of user — so the `life_areas` table's
 * primary key is `id` alone, the same as `habits`/`journal_entries`, not
 * the `(id, user_id)` composite Day/Week need for their date-keyed ids.
 *
 * Like Week, there's no legacy key-format problem and no cross-domain
 * source, so `migrateLifeAreasToCloud` needs no custom import step —
 * `store.runInitialMigration()` alone is enough.
 */
const store = createSyncedStore<LifeArea, LifeAreaRow>({
  storageKey: LIFE_AREA_STORAGE_KEY,
  table: "life_areas",
  normalize: normalizeLifeArea,
  fromRow,
  toRow,
});

export function getLifeAreas(): LifeArea[] {
  return store.getAll();
}

export function getLifeArea(id: string): LifeArea | undefined {
  return store.getOne(id);
}

export function saveLifeArea(area: LifeArea): void {
  store.save(area);
}

export function updateLifeArea(
  id: string,
  updater: (area: LifeArea) => LifeArea,
): LifeArea | undefined {
  return store.update(id, updater);
}

export function removeLifeArea(id: string): void {
  store.remove(id);
}

export function subscribeToLifeAreas(listener: () => void): () => void {
  return store.subscribe(listener);
}

export function setLifeAreaSyncUserId(userId: string | null): void {
  store.setUserId(userId);
}

export function pullLifeAreas(): Promise<void> {
  return store.pull();
}

export function migrateLifeAreasToCloud(): Promise<void> {
  return store.runInitialMigration();
}
