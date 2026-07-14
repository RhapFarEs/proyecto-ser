-- Habit domain cloud sync (Proyecto SER)
--
-- This migration is NOT applied automatically. Run it yourself, either:
--   - via the Supabase CLI: `supabase db push` (or `supabase migration up`
--     if you use local dev migrations), or
--   - by pasting this file into the Supabase dashboard's SQL Editor and
--     running it once.
--
-- Habit is the reference domain for cloud sync: this table's shape (id
-- supplied by the client so it round-trips unchanged from localStorage,
-- a user_id owner column, a deleted_at tombstone instead of a hard
-- delete, created_at/updated_at) is the template every future synced
-- domain (Life Areas, Days, Weeks, Direction, Journal) should copy.

create table if not exists public.habits (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  purpose text not null default '',
  weekdays jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  deleted_at timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists habits_user_id_idx on public.habits (user_id);

-- Row Level Security: the browser only ever holds the anon key, so
-- without this, any signed-in user could read or write any other user's
-- habits.
alter table public.habits enable row level security;

-- `drop policy if exists` first: same idempotency reasoning as the
-- profiles migration — safe to re-run against a database where these
-- already exist, without touching any table rows.
drop policy if exists "Users can view their own habits" on public.habits;
create policy "Users can view their own habits"
  on public.habits for select
  using (auth.uid () = user_id);

drop policy if exists "Users can insert their own habits" on public.habits;
create policy "Users can insert their own habits"
  on public.habits for insert
  with check (auth.uid () = user_id);

drop policy if exists "Users can update their own habits" on public.habits;
create policy "Users can update their own habits"
  on public.habits for update
  using (auth.uid () = user_id)
  with check (auth.uid () = user_id);
