"use client";

import type { ReactNode } from "react";

import AppLayout from "@/components/layout/AppLayout";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import FullScreenLoader from "@/components/ui/FullScreenLoader";
import { useAuth } from "@/lib/auth/AuthContext";

type OnboardingGateProps = {
  children: ReactNode;
};

/**
 * Sits between AuthGate's authenticated branch and the real app: shows the
 * onboarding flow exactly once per account, while `profile.onboardingCompleted`
 * is still false, then renders the ordinary `AppLayout` afterward. Profile
 * state comes from `AuthContext`, which already fetches it once during
 * sign-in as part of the existing bootstrap — this never fetches it again.
 */
export default function OnboardingGate({ children }: OnboardingGateProps) {
  const { user, profile, profileLoading } = useAuth();

  if (!user) {
    return null;
  }

  if (profileLoading) {
    return <FullScreenLoader />;
  }

  if (profile && !profile.onboardingCompleted) {
    return <OnboardingFlow user={user} profile={profile} />;
  }

  return <AppLayout>{children}</AppLayout>;
}
