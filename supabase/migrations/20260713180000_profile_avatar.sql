-- Profile avatar support (Proyecto SER)
--
-- This migration is NOT applied automatically. Run it yourself, either:
--   - via the Supabase CLI: `supabase db push` (or `supabase migration up`
--     if you use local dev migrations), or
--   - by pasting this file into the Supabase dashboard's SQL Editor and
--     running it once.

alter table public.profiles
  add column if not exists avatar_url text null;

-- Storage bucket for profile photos. Public so avatar images can be shown
-- via a plain URL, the same way Google's own avatar CDN works, without
-- generating a signed URL per request.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Uploaded objects are namespaced as `<user id>/avatar.jpg`, so the insert
-- and update policies below check that the first path segment matches the
-- signed-in user's id, restricting writes to a user's own avatar only.
--
-- `drop policy if exists` first: same idempotency reasoning as the
-- profiles migration — safe to re-run against a database where these
-- already exist, without touching any stored objects.
drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
