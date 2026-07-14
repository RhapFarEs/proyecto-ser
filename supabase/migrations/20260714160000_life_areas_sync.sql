-- Life Area domain cloud sync (Proyecto SER)
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
-- Primary key is `id` alone, NOT `(id, user_id)`. Unlike `days`/`weeks`
-- (whose id is a calendar date key, shared by every user), Life Area's id
-- is a `crypto.randomUUID()` generated on creation — globally unique
-- regardless of which user created it. A single-column `id` primary key
-- is both correct and simpler, matching `habits`/`journal_entries`.

create table if not exists public.life_areas (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  why_it_matters text not null default '',
  active boolean not null default true,
  in_focus boolean not null default false,
  deleted_at timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists life_areas_user_id_idx on public.life_areas (user_id);

-- Row Level Security: the browser only ever holds the anon key, so
-- without this, any signed-in user could read or write any other user's
-- life areas.
alter table public.life_areas enable row level security;

drop policy if exists "Users can view their own life areas" on public.life_areas;
create policy "Users can view their own life areas"
  on public.life_areas for select
  using (auth.uid () = user_id);

drop policy if exists "Users can insert their own life areas" on public.life_areas;
create policy "Users can insert their own life areas"
  on public.life_areas for insert
  with check (auth.uid () = user_id);

drop policy if exists "Users can update their own life areas" on public.life_areas;
create policy "Users can update their own life areas"
  on public.life_areas for update
  using (auth.uid () = user_id)
  with check (auth.uid () = user_id);
