import storage from "@/lib/storage/storage";
import { createLifeDirection, type LifeDirection } from "./direction";

export const LIFE_DIRECTION_STORAGE_KEY = "ser.direction";

function isLifeDirection(value: unknown): value is LifeDirection {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as { statement?: unknown }).statement === "string"
  );
}

export function getLifeDirection(): LifeDirection {
  const stored = storage.get<LifeDirection>(LIFE_DIRECTION_STORAGE_KEY, undefined);
  return isLifeDirection(stored) ? stored : createLifeDirection();
}

export function saveLifeDirection(statement: string): LifeDirection {
  const next: LifeDirection = {
    statement,
    updatedAt: new Date().toISOString(),
  };

  storage.set(LIFE_DIRECTION_STORAGE_KEY, next);
  return next;
}
