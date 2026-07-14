-- Day domain cloud sync (Proyecto SER)
--
-- This migration is NOT applied automatically. Run it yourself, either:
--   - via the Supabase CLI: `supabase db push` (or `supabase migration up`
--     if you use local dev migrations), or
--   - by pasting this file into the Supabase dashboard's SQL Editor and
--     running it once.
--
-- Same shape and RLS pattern as `habits`/`journal_entries`: a `user_id`
-- owner column, a `deleted_at` tombstone instead of a hard delete,
-- created_at/updated_at preserved from the client.
--
-- IMPORTANT difference from every other synced table so far: `id` here is
-- the calendar date key (e.g. "2026-07-14"), not a random UUID — it is
-- only unique *within* one user's data, not globally, since every user has
-- a day called "2026-07-14". The primary key is therefore the pair
-- `(id, user_id)`, not `id` alone — otherwise two different users' rows
-- for the same date would collide.

create table if not exists public.days (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  date text not null,
  entries jsonb not null default '[]'::jsonb,
  journal jsonb not null default '{"mood": "calm", "entry": "", "closing": ""}'::jsonb,
  rituals jsonb not null default '{"checks": []}'::jsonb,
  intention text not null default '',
  deleted_at timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (id, user_id)
);

create index if not exists days_user_id_idx on public.days (user_id);

-- Row Level Security: the browser only ever holds the anon key, so
-- without this, any signed-in user could read or write any other user's
-- days.
alter table public.days enable row level security;

drop policy if exists "Users can view their own days" on public.days;
create policy "Users can view their own days"
  on public.days for select
  using (auth.uid () = user_id);

drop policy if exists "Users can insert their own days" on public.days;
create policy "Users can insert their own days"
  on public.days for insert
  with check (auth.uid () = user_id);

drop policy if exists "Users can update their own days" on public.days;
create policy "Users can update their own days"
  on public.days for update
  using (auth.uid () = user_id)
  with check (auth.uid () = user_id);
