-- Direction becomes append-only (Proyecto SER — ROADMAP.md P0.1)
--
-- This migration is NOT applied automatically. Run it yourself, either:
--   - via the Supabase CLI: `supabase db push` (or `supabase migration up`
--     if you use local dev migrations), or
--   - by pasting this file into the Supabase dashboard's SQL Editor and
--     running it once.
--
-- Until now `direction` held exactly one row per user, under the fixed id
-- "direction", and every save overwrote `statement` in place. A person who
-- rewrote their direction in 2029 destroyed what they believed in 2026.
-- CONSTITUTION.md, Second Law corollary: nothing meaningful is ever
-- overwritten — revision appends.
--
-- After this migration each save inserts a NEW row with a generated id,
-- pointing at the one it replaces. The table stops being a singleton and
-- becomes a history.
--
-- There is no data migration, and that is the point. The existing row is
-- already a valid first revision: it has text, a created_at, and no
-- predecessor. It is not moved, copied, or rewritten — only reinterpreted.
-- The row that was "the direction" is now "the first thing they believed."

-- The revision relation: the id of the revision this one replaces.
-- Null means this is the beginning of a chain.
--
-- Deliberately NOT a foreign key. A composite self-reference to
-- (id, user_id) would enforce integrity at the cost of correctness during
-- sync: a client can legitimately push a child revision before its parent
-- has arrived from another device, and an FK would reject it. A dangling
-- `supersedes` is harmless by design — chain-head resolution asks which
-- ids are *referenced*, which never requires the target to exist yet.
alter table public.direction
  add column if not exists supersedes text null;

-- The atmosphere the person was writing in.
--
-- Not UI state: an atmosphere is the place someone deliberately chose to
-- sit in, and it belongs to the act of writing. A revision is exactly one
-- act of writing, so this is the finest grain at which the value is true.
--
-- Added now rather than later because it cannot be backfilled. Where a
-- person was while writing exists nowhere else — no log, no backup, no
-- inference. Every revision written before this column exists is
-- permanently missing it.
--
-- Stores the atmosphere *id*, never its colour tokens. An atmosphere is a
-- place, and a place repainted is the same place; freezing hex values into
-- every row would also misrepresent the choice, since nobody chooses a
-- palette — they choose the lamp at night. This makes atmosphere ids
-- permanent vocabulary: they may be refined, never reused or repurposed.
--
-- Deliberately unconstrained. A CHECK against the known ids would break
-- the moment a client is newer than the database, or an atmosphere is
-- retired; unknown ids are expected to degrade to the default in the
-- client rather than fail a write.
alter table public.direction
  add column if not exists atmosphere text null;

-- No index on `supersedes`.
--
-- Chain resolution happens client-side over the user's own revisions,
-- which are already loaded in full — a person accumulates a handful of
-- direction statements in a lifetime, not a working set. An index here
-- would be maintained for a query that is never issued.
