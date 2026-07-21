import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// TEMPORARY diagnostic instrumentation — remove once the deployed env var
// values have been confirmed against .env.local. Never logs the full key.
console.log("[AUTH-TRACE-ENV] NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("[AUTH-TRACE-ENV] NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (partial):", {
  first12: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.slice(0, 12) ?? null,
  last6: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.slice(-6) ?? null,
  length: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.length ?? 0,
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local (Project Settings -> API " +
      "in the Supabase dashboard).",
  );
}

/**
 * Single reusable Supabase client for the whole app. Session persistence
 * (localStorage-backed) and OAuth redirect handling are the client's
 * default behavior — nothing extra is configured here on purpose, since
 * this milestone only introduces authentication, not a broader Supabase
 * integration.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// TEMPORARY diagnostic instrumentation — remove once the OAuth session-loss
// root cause is confirmed. Dumps every sb-*-auth-token key in localStorage,
// truncated so full JWTs never hit the console.
export function snapshotAuthStorage(label: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const snapshot: Record<string, string> = {};
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith("sb-")) {
      const value = window.localStorage.getItem(key) ?? "";
      snapshot[key] =
        value.length > 60 ? `${value.slice(0, 60)}…(${value.length} chars)` : value;
    }
  }

  console.log(`[AUTH-TRACE] localStorage @ ${label}`, snapshot);
}

if (typeof window !== "undefined") {
  console.log("[AUTH-TRACE] createClient() module init", {
    href: window.location.href,
    hash: window.location.hash,
  });
  snapshotAuthStorage("module init (createClient just returned)");
}
