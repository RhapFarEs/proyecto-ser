-- Onboarding completion flag (Proyecto SER)
--
-- This migration is NOT applied automatically. Run it yourself, either:
--   - via the Supabase CLI: `supabase db push` (or `supabase migration up`
--     if you use local dev migrations), or
--   - by pasting this file into the Supabase dashboard's SQL Editor and
--     running it once.

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

-- Existing accounts predate onboarding entirely — treat them as already
-- onboarded so this migration doesn't interrupt anyone already using the
-- app. Only genuinely new profiles (created after this migration runs)
-- start with onboarding_completed = false, via createProfile().
update public.profiles set onboarding_completed = true where onboarding_completed = false;
