-- Journal domain cloud sync (Proyecto SER)
--
-- This migration is NOT applied automatically. Run it yourself, either:
--   - via the Supabase CLI: `supabase db push` (or `supabase migration up`
--     if you use local dev migrations), or
--   - by pasting this file into the Supabase dashboard's SQL Editor and
--     running it once.
--
-- Same shape and RLS pattern as `habits` (see 20260713190000_habits_sync.sql):
-- client-supplied `id`, a `user_id` owner column, a `deleted_at` tombstone
-- instead of a hard delete, created_at/updated_at preserved from the client.

create table if not exists public.journal_entries (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  day_key text not null,
  mood text not null default '',
  content text not null default '',
  deleted_at timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists journal_entries_user_id_idx on public.journal_entries (user_id);
create index if not exists journal_entries_day_key_idx on public.journal_entries (day_key);

-- Row Level Security: the browser only ever holds the anon key, so
-- without this, any signed-in user could read or write any other user's
-- journal entries.
alter table public.journal_entries enable row level security;

drop policy if exists "Users can view their own journal entries" on public.journal_entries;
create policy "Users can view their own journal entries"
  on public.journal_entries for select
  using (auth.uid () = user_id);

drop policy if exists "Users can insert their own journal entries" on public.journal_entries;
create policy "Users can insert their own journal entries"
  on public.journal_entries for insert
  with check (auth.uid () = user_id);

drop policy if exists "Users can update their own journal entries" on public.journal_entries;
create policy "Users can update their own journal entries"
  on public.journal_entries for update
  using (auth.uid () = user_id)
  with check (auth.uid () = user_id);
