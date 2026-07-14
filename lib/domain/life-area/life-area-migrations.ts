import type { LifeArea } from "./life-area";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Normalizes one raw stored record to the current LifeArea shape — the
 * `createSyncedStore` `normalize` hook (same role as `migrateHabit` /
 * `normalizeWeek`). Like Week, Life Area never had a legacy key-format
 * problem and isn't sourced from another domain, so this one function is
 * all `migrateLifeAreasToCloud` needs — no separate one-time import step.
 */
export function normalizeLifeArea(raw: unknown): LifeArea | null {
  if (!isRecord(raw)) {
    return null;
  }

  if (typeof raw.id !== "string") {
    return null;
  }

  return {
    id: raw.id,
    title: typeof raw.title === "string" ? raw.title : "",
    whyItMatters: typeof raw.whyItMatters === "string" ? raw.whyItMatters : "",
    active: typeof raw.active === "boolean" ? raw.active : true,
    inFocus: typeof raw.inFocus === "boolean" ? raw.inFocus : false,
    deletedAt: typeof raw.deletedAt === "string" ? raw.deletedAt : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
  };
}
