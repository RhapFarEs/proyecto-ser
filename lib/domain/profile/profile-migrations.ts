import type { User } from "@supabase/supabase-js";

import { createProfile } from "./profile";
import { getProfile, saveProfile } from "./profile-storage";
import { DAY_STORAGE_KEY } from "@/lib/domain/day/day-storage";
import { WEEK_STORAGE_KEY } from "@/lib/domain/week/week-storage";
import { HABIT_STORAGE_KEY } from "@/lib/domain/habit/habit-storage";
import { LIFE_AREA_STORAGE_KEY } from "@/lib/domain/life-area/life-area-storage";
import { LIFE_DIRECTION_STORAGE_KEY } from "@/lib/domain/direction/direction-storage";

// Presence-only check against each domain's own storage key — this reads
// nothing about *what* is stored, only *whether* something is. Day, Week,
// Habit, Life Area, and Direction are otherwise completely untouched by
// this milestone; their data still lives exclusively in localStorage.
const LOCAL_DATA_KEYS = [
  DAY_STORAGE_KEY,
  WEEK_STORAGE_KEY,
  HABIT_STORAGE_KEY,
  LIFE_AREA_STORAGE_KEY,
  LIFE_DIRECTION_STORAGE_KEY,
];

function hasLocalProyectoSerData(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return LOCAL_DATA_KEYS.some((key) => window.localStorage.getItem(key) !== null);
}

function getMetadataString(
  metadata: Record<string, unknown> | undefined,
  ...keys: string[]
): string | undefined {
  if (!metadata) {
    return undefined;
  }

  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function getGoogleDisplayName(user: User): string {
  return (
    getMetadataString(user.user_metadata, "full_name", "name") ?? user.email ?? ""
  );
}

function getGoogleAvatarUrl(user: User): string | null {
  return getMetadataString(user.user_metadata, "avatar_url", "picture") ?? null;
}

/**
 * Ensures a Profile exists for this user, creating one from their Google
 * account info the first time it's called for that user. Idempotent:
 * checks for an existing profile first and does nothing if one is found,
 * so calling it again (every login, every session restore) is always
 * safe.
 *
 * `migrationCompleted` is set to `false` only when this browser already
 * holds Proyecto SER data (something will eventually need migrating);
 * otherwise `true`, since there is nothing local to migrate. No actual
 * Day/Week/Habit/Life Area/Direction data is read, copied, or modified —
 * this only prepares the flag a future migration step would check.
 */
export async function runInitialMigration(user: User): Promise<void> {
  const existing = await getProfile(user.id);

  if (existing) {
    return;
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const migrationCompleted = !hasLocalProyectoSerData();

  await saveProfile(
    createProfile(
      user.id,
      getGoogleDisplayName(user),
      timezone,
      migrationCompleted,
      getGoogleAvatarUrl(user),
    ),
  );
}
