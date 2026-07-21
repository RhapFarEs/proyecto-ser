import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (Project Settings -> API " +
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

  // TEMPORARY diagnostic instrumentation — remove once the OAuth
  // session-loss root cause is confirmed. Reads the access_token straight
  // out of the raw hash (before the SDK's own internal processing can clear
  // it) and replays the exact same public call the SDK makes internally
  // (auth-js's _getSessionFromURL calls this.getUser(access_token), and
  // getUser(jwt) with an explicit jwt argument is a direct passthrough to
  // the same private _getUser(jwt) — see node_modules/@supabase/auth-js/
  // src/GoTrueClient.ts). This only uses the public SDK API from app code;
  // node_modules is untouched.
  if (window.location.hash.includes("access_token=")) {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const accessTokenFromHash = hashParams.get("access_token");
    console.log("[AUTH-TRACE-REPRO] access_token found in raw hash", {
      tokenPrefix: accessTokenFromHash ? `${accessTokenFromHash.slice(0, 12)}...` : null,
      tokenLength: accessTokenFromHash?.length ?? 0,
    });

    if (accessTokenFromHash) {
      supabase.auth.getUser(accessTokenFromHash).then(({ data, error }) => {
        console.log("[AUTH-TRACE-REPRO] getUser(access_token_from_hash) result", {
          data,
          error,
          errorName: error?.name,
          errorMessage: error?.message,
          errorStatus: (error as { status?: number } | null)?.status,
          errorCode: (error as { code?: string } | null)?.code,
        });
      });
    }
  }
}
