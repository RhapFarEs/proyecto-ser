import storage from "@/lib/storage/storage";
import { type LifeArea } from "./life-area";

export const LIFE_AREA_STORAGE_KEY = "ser.life-areas";

function getLifeAreasStore(): Record<string, LifeArea> {
  const storedValue = storage.get<Record<string, LifeArea>>(LIFE_AREA_STORAGE_KEY, {});

  if (!storedValue || typeof storedValue !== "object") {
    return {};
  }

  return storedValue;
}

function setLifeAreasStore(areas: Record<string, LifeArea>): void {
  storage.set(LIFE_AREA_STORAGE_KEY, areas);
}

export function getLifeAreas(): LifeArea[] {
  return Object.values(getLifeAreasStore()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function getLifeArea(id: string): LifeArea | undefined {
  return getLifeAreasStore()[id];
}

export function saveLifeArea(area: LifeArea): void {
  const areas = getLifeAreasStore();
  areas[area.id] = area;
  setLifeAreasStore(areas);
}

export function updateLifeArea(
  id: string,
  updater: (area: LifeArea) => LifeArea,
): LifeArea | undefined {
  const current = getLifeArea(id);

  if (!current) {
    return undefined;
  }

  const next: LifeArea = { ...updater(current), updatedAt: new Date().toISOString() };
  saveLifeArea(next);
  return next;
}
