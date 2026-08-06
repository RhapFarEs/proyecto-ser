"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import OnboardingGate from "@/components/auth/OnboardingGate";
import LoginScreen from "@/components/auth/LoginScreen";
import FullScreenLoader from "@/components/ui/FullScreenLoader";
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
/**
 * Readable without an account.
 *
 * A privacy notice someone can only reach by first handing over their data
 * is not a notice. These two also have to stay reachable for a person who
 * has just deleted their account or cannot sign in, which is exactly when
 * someone goes looking for them.
 */
const PUBLIC_PATHS = ["/privacidad", "/terminos"];

export default function AuthGate({ children }: AuthGateProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <OnboardingGate>{children}</OnboardingGate>;
}
