"use client";

import type { ReactNode } from "react";

import OnboardingGate from "@/components/auth/OnboardingGate";
import LoginScreen from "@/components/auth/LoginScreen";
import { useAuth } from "@/lib/auth/AuthContext";

type AuthGateProps = {
  children: ReactNode;
};

/**
 * The single place that decides what the user sees based on auth state.
 * Everything else in the app (Today, Journal, Habits, Weekly Review,
 * Direction, Life Areas) is rendered exactly as before, unconditionally,
 * once a session exists and onboarding is complete — this component only
 * decides whether to show it. `OnboardingGate` owns the one additional
 * decision (has this account finished onboarding yet?) between auth and
 * the real app.
 */
export default function AuthGate({ children }: AuthGateProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-black" />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <OnboardingGate>{children}</OnboardingGate>;
}
