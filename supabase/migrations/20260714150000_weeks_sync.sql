-- Week domain cloud sync (Proyecto SER)
--
-- This migration is NOT applied automatically. Run it yourself, either:
--   - via the Supabase CLI: `supabase db push` (or `supabase migration up`
--     if you use local dev migrations), or
--   - by pasting this file into the Supabase dashboard's SQL Editor and
--     running it once.
--
-- Same shape and RLS pattern as `days`: a `user_id` owner column, a
-- `deleted_at` tombstone instead of a hard delete, created_at/updated_at
-- preserved from the client.
--
-- Primary key is `(id, user_id)`, not `id` alone — same reasoning as
-- `days`. `id` here is the week-start date key (e.g. "2026-07-13"), which
-- every user has one of for any given week; it is only unique *within*
-- one user's data, not globally. A plain `id` primary key would let two
-- different users' rows for the same week collide.
--
-- `focus_life_area_id` is stored as plain `text`, not a foreign key: Life
-- Areas aren't a cloud-synced domain yet, so there is no `life_areas`
-- table to reference.

create table if not exists public.weeks (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  reflection jsonb not null default '{"wentWell": "", "difficult": "", "nextWeekFocus": ""}'::jsonb,
  focus_life_area_id text null,
  deleted_at timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (id, user_id)
);

create index if not exists weeks_user_id_idx on public.weeks (user_id);

-- Row Level Security: the browser only ever holds the anon key, so
-- without this, any signed-in user could read or write any other user's
-- weeks.
alter table public.weeks enable row level security;

drop policy if exists "Users can view their own weeks" on public.weeks;
create policy "Users can view their own weeks"
  on public.weeks for select
  using (auth.uid () = user_id);

drop policy if exists "Users can insert their own weeks" on public.weeks;
create policy "Users can insert their own weeks"
  on public.weeks for insert
  with check (auth.uid () = user_id);

drop policy if exists "Users can update their own weeks" on public.weeks;
create policy "Users can update their own weeks"
  on public.weeks for update
  using (auth.uid () = user_id)
  with check (auth.uid () = user_id);
