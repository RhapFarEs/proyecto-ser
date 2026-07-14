import { getLocalDateKey } from "@/lib/date";

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  birthday: string | null;
  startedAt: string;
  timezone: string;
  migrationCompleted: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export function createProfile(
  id: string,
  displayName: string,
  timezone: string,
  migrationCompleted: boolean,
  avatarUrl: string | null = null,
): Profile {
  const now = new Date().toISOString();

  return {
    id,
    displayName,
    avatarUrl,
    birthday: null,
    startedAt: getLocalDateKey(),
    timezone,
    migrationCompleted,
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
  };
}
