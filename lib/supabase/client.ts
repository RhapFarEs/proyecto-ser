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
