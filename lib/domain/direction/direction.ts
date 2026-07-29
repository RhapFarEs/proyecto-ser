import { resolveCurrent, shouldAppend, type Revision } from "@/lib/domain/revisions/revision";

/**
 * The id of the one row that existed before Direction became append-only.
 *
 * It used to be *the* id: Direction was a singleton, every save overwrote it,
 * and every earlier statement was destroyed. That row is now simply the first
 * revision — it holds real text, a real date, and no predecessor, which is
 * exactly what a first revision is. It was never moved or rewritten, only
 * reinterpreted, which is why this change needed no data migration.
 *
 * Kept as a constant because it is the one non-UUID id in the archive and
 * `supersedes` chains point at it. It must never be reassigned.
 */
export const LEGACY_DIRECTION_ID = "direction";

/**
 * One statement of direction, as written at one moment.
 *
 * `atmosphere` is the place the person was writing in, not a display
 * preference. It records the id, never the colour values: an atmosphere is a
 * room, and a room repainted is the same room.
 */
export interface DirectionRevision extends Revision {
  readonly statement: string;
  readonly atmosphere: string | null;
  readonly updatedAt: string;
}

/**
 * The only way a DirectionRevision comes into existence.
 *
 * Immutability is enforced here and nowhere else. `readonly` fields make
 * mutation a compile error, and this freeze makes it a runtime one — but a
 * freeze repeated at every construction site is a convention, not a
 * guarantee, because the next constructor to be added is the one that forgets.
 * Routing every path through a single function is what makes it structural:
 * localStorage, Supabase, the legacy import and a new save all arrive here.
 *
 * Deliberately low-level and total — it takes every field rather than
 * defaulting any — so that callers restoring a stored revision can reproduce
 * it exactly, including its tombstone and its original dates.
 */
export function directionRevision(fields: {
  id: string;
  statement: string;
  supersedes: string | null;
  atmosphere: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}): DirectionRevision {
  return Object.freeze({
    id: fields.id,
    statement: fields.statement,
    supersedes: fields.supersedes,
    atmosphere: fields.atmosphere,
    deletedAt: fields.deletedAt,
    createdAt: fields.createdAt,
    updatedAt: fields.updatedAt,
  });
}

/**
 * Appends a statement to a chain, or decides that nothing should be written.
 *
 * The whole decision of the sprint lives here, and it is deliberately pure:
 * every input that varies — the id, the clock, the room the person is sitting
 * in — is passed in rather than reached for. That is what makes the behaviour
 * this change exists to guarantee directly testable, instead of only its
 * parts. The storage layer supplies the impure values and does nothing else.
 *
 * Returns null when nothing should be appended — unchanged or empty text —
 * so the caller can tell "saved" from "no-op" without comparing strings
 * again.
 *
 * Note that it supersedes the *current* revision rather than the newest one.
 * Those differ when two devices disagree about the time, and the chain is the
 * one that is right.
 */
export function appendDirectionRevision(
  revisions: readonly DirectionRevision[],
  statement: string,
  context: { id: string; now: string; atmosphere: string | null },
): DirectionRevision | null {
  const current = resolveCurrent(revisions);

  if (!shouldAppend(current?.statement ?? null, statement)) {
    return null;
  }

  return directionRevision({
    id: context.id,
    statement: statement.trim(),
    supersedes: current?.id ?? null,
    atmosphere: context.atmosphere,
    deletedAt: null,
    createdAt: context.now,
    updatedAt: context.now,
  });
}
