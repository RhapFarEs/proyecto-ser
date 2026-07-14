-- User Profile domain (Proyecto SER)
--
-- This migration is NOT applied automatically. Run it yourself, either:
--   - via the Supabase CLI: `supabase db push` (or `supabase migration up`
--     if you use local dev migrations), or
--   - by pasting this file into the Supabase dashboard's SQL Editor and
--     running it once.
--
-- `migration_completed` is not in the milestone's literal column list, but
-- is required by it ("store a boolean: migration_completed inside the
-- profile") — added here as a real column rather than tracked anywhere
-- else, so the profile stays the single source of truth for it.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  birthday date null,
  started_at date not null,
  timezone text not null,
  migration_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security: the browser only ever holds the anon key, so without
-- this, any signed-in user could read or write any other user's profile.
alter table public.profiles enable row level security;

-- `drop policy if exists` before every `create policy`: this project's
-- table and policies were originally created by hand (before the CLI
-- migration history existed), so this file must be safe to run against a
-- database where these policies already exist under the same names —
-- `create policy` has no `if not exists` form, so drop-then-recreate is
-- the idiomatic idempotent equivalent. This never touches table rows.
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid () = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid () = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid () = id)
  with check (auth.uid () = id);
