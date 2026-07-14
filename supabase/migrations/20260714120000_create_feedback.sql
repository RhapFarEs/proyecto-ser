-- Feedback domain (Proyecto SER)
--
-- This migration is NOT applied automatically. Run it yourself, either:
--   - via the Supabase CLI: `supabase db push` (or `supabase migration up`
--     if you use local dev migrations), or
--   - by pasting this file into the Supabase dashboard's SQL Editor and
--     running it once.
--
-- `resolved` exists for admin-side triage only — the app never reads or
-- writes it; it's not part of the client-side Feedback type at all.

create table if not exists public.feedback (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  message text not null,
  route text not null,
  app_version text not null,
  device text not null,
  os text not null,
  browser text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists feedback_user_id_idx on public.feedback (user_id);

-- Row Level Security: only an insert policy, on purpose. Feedback is a
-- one-way "drop a note" channel — nobody, including the person who wrote
-- it, can read it back through the anon-keyed client. Admin triage reads
-- via the Supabase dashboard, which uses the service role and bypasses
-- RLS entirely.
alter table public.feedback enable row level security;

drop policy if exists "Users can submit their own feedback" on public.feedback;
create policy "Users can submit their own feedback"
  on public.feedback for insert
  with check (auth.uid () = user_id);
