import type { Revision } from "@/lib/domain/revisions/revision";

/**
 * The id of the one row that existed before Direction became append-only.
 *
 * It used to be *the* id: Direction was a singleton, every save overwrote it,
 * and every earlier statement was destroyed. That row is now simply the first
 * revision — it holds real text, a real date, and no predecessor, which is
 * exactly what a first revision is. It was never moved or rewritten, only
 * reinterpreted, which is why this migration needed no data migration.
 *
 * Kept as a constant because it is the one non-UUID id in the archive and
 * `supersedes` chains point at it. It must never be reassigned.
 */
export const LEGACY_DIRECTION_ID = "direction";

/**
 * One statement of direction, as written at one moment.
 *
 * Immutable by contract and by construction — `readonly` makes mutation a
 * compile error and `Object.freeze` makes it a runtime one. This is the
 * invariant the whole sprint exists to establish, so it is enforced twice
 * rather than documented once.
 *
 * `atmosphere` is the place the person was writing in, not a display
 * preference. It records the id, never the colour values: an atmosphere is a
 * room, and a room repainted is the same room. That makes atmosphere ids
 * permanent vocabulary — they may be refined, never reused for a different
 * place (see the note in lib/domain/atmosphere/atmosphere.ts).
 */
export interface DirectionRevision extends Revision {
  readonly statement: string;
  readonly atmosphere: string | null;
  readonly updatedAt: string;
}

/**
 * All inputs are explicit, including `id` and `now`.
 *
 * Generating them inside would make every revision unpredictable and this
 * function untestable without mocking the clock and the crypto module. The
 * impure edges belong in the storage layer, which is the only place that
 * should know what time it is.
 */
export function createDirectionRevision(input: {
  id: string;
  now: string;
  statement: string;
  supersedes: string | null;
  atmosphere: string | null;
}): DirectionRevision {
  return Object.freeze({
    id: input.id,
    statement: input.statement,
    supersedes: input.supersedes,
    atmosphere: input.atmosphere,
    deletedAt: null,
    createdAt: input.now,
    updatedAt: input.now,
  });
}

/**
 * A stand-in for "nothing written yet", so the four screens that read the
 * current statement never have to handle null. It is never stored — it exists
 * only to be rendered as an empty field.
 */
export function createEmptyDirectionRevision(): DirectionRevision {
  const now = new Date().toISOString();

  return Object.freeze({
    id: LEGACY_DIRECTION_ID,
    statement: "",
    supersedes: null,
    atmosphere: null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  });
}
