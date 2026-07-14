-- Direction domain cloud sync (Proyecto SER)
--
-- This migration is NOT applied automatically. Run it yourself, either:
--   - via the Supabase CLI: `supabase db push` (or `supabase migration up`
--     if you use local dev migrations), or
--   - by pasting this file into the Supabase dashboard's SQL Editor and
--     running it once.
--
-- Same shape and RLS pattern as `habits`/`journal_entries`/`days`/`weeks`/
-- `life_areas`: a `user_id` owner column, a `deleted_at` tombstone instead
-- of a hard delete, created_at/updated_at preserved from the client.
--
-- Primary key is `(id, user_id)`, not `id` alone. Direction is a
-- singleton per user — every row's `id` is the same fixed constant
-- (`"direction"`, see `LIFE_DIRECTION_ID`), so `id` on its own is the
-- least unique value possible here. This is the same reasoning already
-- applied to `days`/`weeks` (whose id is a calendar key shared across
-- users), just the most extreme case of it.

create table if not exists public.direction (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  statement text not null default '',
  deleted_at timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (id, user_id)
);

create index if not exists direction_user_id_idx on public.direction (user_id);

-- Row Level Security: the browser only ever holds the anon key, so
-- without this, any signed-in user could read or write any other user's
-- direction statement.
alter table public.direction enable row level security;

drop policy if exists "Users can view their own direction" on public.direction;
create policy "Users can view their own direction"
  on public.direction for select
  using (auth.uid () = user_id);

drop policy if exists "Users can insert their own direction" on public.direction;
create policy "Users can insert their own direction"
  on public.direction for insert
  with check (auth.uid () = user_id);

drop policy if exists "Users can update their own direction" on public.direction;
create policy "Users can update their own direction"
  on public.direction for update
  using (auth.uid () = user_id)
  with check (auth.uid () = user_id);
