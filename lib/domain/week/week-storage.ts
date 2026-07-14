import storage from "@/lib/storage/storage";
import { createWeek, type Week } from "./week";

export const WEEK_STORAGE_KEY = "ser.weeks";

function getWeeksStore(): Record<string, Week> {
  const storedValue = storage.get<Record<string, Week>>(WEEK_STORAGE_KEY, {});

  if (!storedValue || typeof storedValue !== "object") {
    return {};
  }

  return storedValue;
}

function setWeeksStore(weeks: Record<string, Week>): void {
  storage.set(WEEK_STORAGE_KEY, weeks);
}

export function getWeek(id: string): Week {
  const weeks = getWeeksStore();
  return weeks[id] ?? createWeek(id);
}

export function updateWeek(id: string, updater: (week: Week) => Week): Week {
  const current = getWeek(id);
  const next: Week = { ...updater(current), updatedAt: new Date().toISOString() };

  const weeks = getWeeksStore();
  weeks[id] = next;
  setWeeksStore(weeks);

  return next;
}
