"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { runInitialMigration } from "@/lib/domain/profile/profile-migrations";
import { getProfile, updateProfile } from "@/lib/domain/profile/profile-storage";
import type { Profile } from "@/lib/domain/profile/profile";
import {
  migrateHabitsToCloud,
  pullHabits,
  setHabitSyncUserId,
} from "@/lib/domain/habit/habit-storage";
import {
  migrateJournalToCloud,
  pullJournalNotes,
  setJournalSyncUserId,
} from "@/lib/domain/journal/journal-storage";
import {
  migrateDaysToCloud,
  pullDays,
  setDaySyncUserId,
} from "@/lib/domain/day/day-storage";
import {
  migrateWeeksToCloud,
  pullWeeks,
  setWeekSyncUserId,
} from "@/lib/domain/week/week-storage";
import {
  migrateLifeAreasToCloud,
  pullLifeAreas,
  setLifeAreaSyncUserId,
} from "@/lib/domain/life-area/life-area-storage";
import {
  migrateLifeDirectionToCloud,
  pullLifeDirection,
  setLifeDirectionSyncUserId,
} from "@/lib/domain/direction/direction-storage";

interface SyncedDomain {
  setUserId: (userId: string | null) => void;
  migrateToCloud: () => Promise<void>;
  pull: () => Promise<void>;
}

/**
 * Every cloud-synced domain, in one place — the single source of truth
 * for bootstrap order, so `setUserId`/migrate/pull can't drift out of
 * sync with each other the way three separately-maintained call lists
 * would. Adding a seventh synced domain later means adding one entry
 * here, not editing three different blocks below.
 *
 * Order matters only for the reasons noted: Day must migrate before
 * Journal, because Journal's own migration reads `getAllDays()` to lift
 * notes out of legacy Day records. Every other domain is independent of
 * this order and of each other — Week, Life Area, and Direction are
 * simply grouped with Day as the other domains Today reads directly.
 */
const SYNCED_DOMAINS: SyncedDomain[] = [
  { setUserId: setDaySyncUserId, migrateToCloud: migrateDaysToCloud, pull: pullDays },
  { setUserId: setWeekSyncUserId, migrateToCloud: migrateWeeksToCloud, pull: pullWeeks },
  { setUserId: setLifeAreaSyncUserId, migrateToCloud: migrateLifeAreasToCloud, pull: pullLifeAreas },
  { setUserId: setLifeDirectionSyncUserId, migrateToCloud: migrateLifeDirectionToCloud, pull: pullLifeDirection },
  { setUserId: setHabitSyncUserId, migrateToCloud: migrateHabitsToCloud, pull: pullHabits },
  { setUserId: setJournalSyncUserId, migrateToCloud: migrateJournalToCloud, pull: pullJournalNotes },
];

function setAllSyncUserIds(userId: string | null): void {
  for (const domain of SYNCED_DOMAINS) {
    domain.setUserId(userId);
  }
}

async function migrateAllDomainsToCloud(): Promise<void> {
  for (const domain of SYNCED_DOMAINS) {
    await domain.migrateToCloud();
  }
}

async function pullAllDomains(): Promise<void> {
  for (const domain of SYNCED_DOMAINS) {
    await domain.pull();
  }
}

/**
 * Runs once per session start (login, session restore, or a completed
 * "cambiar de cuenta"): ensures a profile exists, then wires every synced
 * domain's store to this user. The one-time historical upload only fires
 * while `profile.migrationCompleted` is still false, and is never run
 * again once it flips to true — each domain's upload is itself
 * idempotent, but gating on the flag avoids re-uploading on every login.
 * `pullAllDomains` then reconciles whatever's already in Supabase (from
 * this upload, from another device, or both) into each local cache.
 *
 * `onProfileReady` hands the resolved profile back to the component so it
 * can be exposed via context — `OnboardingGate` reads it from there rather
 * than fetching it a second time.
 */
async function bootstrapUserData(
  user: User,
  onProfileReady: (profile: Profile | null) => void,
): Promise<void> {
  await runInitialMigration(user);

  let profile = await getProfile(user.id);

  if (!profile) {
    onProfileReady(null);
    return;
  }

  setAllSyncUserIds(user.id);

  if (!profile.migrationCompleted) {
    await migrateAllDomainsToCloud();
    profile =
      (await updateProfile(user.id, (current) => ({
        ...current,
        migrationCompleted: true,
      }))) ?? profile;
  }

  onProfileReady(profile);

  await pullAllDomains();
}

function ensureProfile(
  user: User,
  onProfileReady: (profile: Profile | null) => void,
): void {
  void bootstrapUserData(user, onProfileReady).catch((error: unknown) => {
    console.error("Failed to synchronize user data:", error);
    onProfileReady(null);
  });
}

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  changeAccount: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

/**
 * Owns the Supabase auth session for the whole app.
 *
 * `session` starts `null` and `loading` starts `true` on every render,
 * including the client's hydration render — the real session (which lives
 * in localStorage, exactly like the app's own domain data) is only read
 * inside the effect below, after mount. This is the same hydration-safety
 * principle as `lib/hooks/useClientState.ts`, applied by hand here because
 * Supabase's session load is asynchronous and needs an ongoing
 * subscription (`onAuthStateChange`), which doesn't fit that hook's
 * synchronous, load-once shape.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const handleProfileReady = (loaded: Profile | null) => {
      if (active) {
        setProfile(loaded);
        setProfileLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setLoading(false);
      }

      if (data.session?.user) {
        ensureProfile(data.session.user, handleProfileReady);
      } else {
        setAllSyncUserIds(null);
        handleProfileReady(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);

      if (nextSession?.user) {
        setProfileLoading(true);
        ensureProfile(nextSession.user, handleProfileReady);
      } else {
        setAllSyncUserIds(null);
        handleProfileReady(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Rejects on failure so the caller can say something. Previously the
   * error was swallowed, so a failed sign-in looked exactly like a button
   * that does nothing — the worst possible first impression.
   */
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      throw error;
    }
  };

  /**
   * Google keeps its own signed-in session in the browser, so a plain
   * `signInWithOAuth` call after `signOut` would silently re-authenticate
   * as the same account without ever showing a picker. `prompt: "select_account"`
   * is the OAuth parameter that tells Google to show the account chooser
   * regardless of its existing session, which is what "switch account"
   * actually needs — signing out alone would only land back on the login
   * screen, not let the user pick someone else.
   */
  const changeAccount = async () => {
    await supabase.auth.signOut();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  /** Re-reads the current user's profile and updates context — used after Onboarding writes to it. */
  const refreshProfile = async () => {
    if (!session?.user) {
      return;
    }

    const loaded = await getProfile(session.user.id);
    setProfile(loaded);
  };

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    loading,
    profile,
    profileLoading,
    refreshProfile,
    signInWithGoogle,
    changeAccount,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
