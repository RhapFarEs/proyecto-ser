-- Account deletion (Proyecto SER)
--
-- This migration is NOT applied automatically. Run it yourself, either:
--   - via the Supabase CLI: `supabase db push` (or `supabase migration up`
--     if you use local dev migrations), or
--   - by pasting this file into the Supabase dashboard's SQL Editor and
--     running it once.
--
-- Two things are needed for a person to be able to leave completely.
--
-- 1. A way to remove their own avatar. Every other policy on the avatars
--    bucket exists (public read, own-folder insert, own-folder update) but
--    there was no delete, so the one file in the product that is not a
--    tombstoned row could never be removed by the person it belongs to.
--
-- 2. A way to delete the account itself. `auth.users` is not writable by the
--    anon key under any policy, which is correct — it is also why deletion
--    cannot be done from the browser and needs a definer function.
--
-- Everything else follows for free: `profiles`, `habits`, `journal_entries`,
-- `days`, `weeks`, `life_areas`, `direction` and `feedback` all declare
-- `references auth.users (id) on delete cascade`, so removing the auth row
-- removes every row of writing in one transaction. Nothing here enumerates
-- those tables, deliberately — a list would be one more place to forget a
-- table the next time a domain is added, and the cascade cannot forget.

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- `security definer` so it can touch `auth.users`, with an empty search_path
-- so every name below is resolved explicitly rather than through whatever
-- schema a caller happens to have in scope.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := auth.uid();
begin
  if account_id is null then
    raise exception 'No authenticated user';
  end if;

  -- The client removes this through the storage API first, which is what
  -- actually deletes the stored file. This clears the row in case that call
  -- did not happen or did not succeed, so no record of the account is left
  -- behind pointing at an image.
  delete from storage.objects
  where bucket_id = 'avatars'
    and (storage.foldername(name))[1] = account_id::text;

  -- Cascades to every table that references it. One statement, one
  -- transaction: either the person is gone or nothing changed.
  delete from auth.users where id = account_id;
end;
$$;

-- Callable only by someone holding a session. `auth.uid()` inside the
-- function is what scopes it, so no caller can name someone else.
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
