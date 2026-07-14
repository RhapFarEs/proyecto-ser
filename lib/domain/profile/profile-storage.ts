import { supabase } from "@/lib/supabase/client";
import type { Profile } from "./profile";

interface ProfileRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  birthday: string | null;
  started_at: string;
  timezone: string;
  migration_completed: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    birthday: row.birthday,
    startedAt: row.started_at,
    timezone: row.timezone,
    migrationCompleted: row.migration_completed,
    onboardingCompleted: row.onboarding_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(profile: Profile): ProfileRow {
  return {
    id: profile.id,
    display_name: profile.displayName,
    avatar_url: profile.avatarUrl,
    birthday: profile.birthday,
    started_at: profile.startedAt,
    timezone: profile.timezone,
    migration_completed: profile.migrationCompleted,
    onboarding_completed: profile.onboardingCompleted,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  };
}

/**
 * Unlike every other *-storage.ts in this codebase, Profile is backed by
 * Supabase (`profiles` table), not localStorage — it's the one piece of
 * Proyecto SER's data that is genuinely per-account rather than
 * per-device. The exposed shape (getProfile/saveProfile/updateProfile)
 * mirrors Day/Week/Habit's storage API on purpose; only the backend and,
 * necessarily, the async return types differ.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? fromRow(data as ProfileRow) : null;
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(toRow(profile))
    .select()
    .single();

  if (error) {
    throw error;
  }

  return fromRow(data as ProfileRow);
}

export async function updateProfile(
  userId: string,
  updater: (profile: Profile) => Profile,
): Promise<Profile | null> {
  const current = await getProfile(userId);

  if (!current) {
    return null;
  }

  const next: Profile = { ...updater(current), updatedAt: new Date().toISOString() };
  return saveProfile(next);
}
