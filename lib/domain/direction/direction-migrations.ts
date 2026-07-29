import { directionRevision, LEGACY_DIRECTION_ID, type DirectionRevision } from "./direction";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function earlier(a: string, b: string): string {
  return a.localeCompare(b) <= 0 ? a : b;
}

/**
 * Normalizes one raw stored record into the current shape — the
 * `createSyncedStore` `normalize` hook.
 *
 * This function previously hardcoded `id: LIFE_DIRECTION_ID` and ignored
 * whatever the record actually held, because Direction was a singleton and
 * there was only ever one id to return. Under append-only that behaviour
 * would collapse every revision onto a single id on the first read from
 * localStorage and destroy the entire history — precisely the loss this
 * change exists to prevent. The id now comes from the record, falling back
 * to the legacy constant only for records old enough to predate having one.
 *
 * It reads and does not correct. An earlier version repaired a fabricated
 * date here, which meant the same revision had one `createdAt` when it came
 * from localStorage and another when it came from Supabase, since `fromRow`
 * did no such thing — and which one you got depended on sync order. Repairs
 * belong to `repairFabricatedDate`, applied once to the data; both read paths
 * are now plain restorations that cannot disagree.
 */
export function normalizeDirectionRevision(raw: unknown): DirectionRevision | null {
  if (!isRecord(raw)) {
    return null;
  }

  // A record missing its dates is corrupt, but dropping it would lose the
  // statement, and losing what someone wrote is worse than dating it badly.
  // Falling back to the other timestamp first keeps this deterministic for
  // every record that has either one; only a record with neither reaches the
  // clock, which no shape this app has ever written can produce.
  const stamped = readString(raw.createdAt) ?? readString(raw.updatedAt);
  const createdAt = stamped ?? new Date().toISOString();

  return directionRevision({
    id: readString(raw.id) ?? LEGACY_DIRECTION_ID,
    statement: typeof raw.statement === "string" ? raw.statement : "",
    supersedes: readString(raw.supersedes),
    atmosphere: readString(raw.atmosphere),
    deletedAt: readString(raw.deletedAt),
    createdAt,
    updatedAt: readString(raw.updatedAt) ?? createdAt,
  });
}

/**
 * The one-time import of Direction's oldest shape: a flat
 * `{ statement, updatedAt }` object stored directly under `ser.direction`,
 * with no id and no entity wrapper.
 *
 * Kept pure — the raw value is passed in rather than read here — so the
 * legacy path is testable without touching localStorage. It produces the
 * first revision of a chain, so `supersedes` is null, and `atmosphere` is
 * null because that was never captured and cannot be invented.
 *
 * The date is the earlier of the import time and the recorded edit time.
 * Correcting it at the moment of creation is what keeps the correction a
 * one-time event rather than something every read has to redo.
 */
export function parseLegacyDirection(raw: unknown, now: string): DirectionRevision | null {
  if (!isRecord(raw) || typeof raw.statement !== "string") {
    return null;
  }

  const updatedAt = readString(raw.updatedAt) ?? now;

  return directionRevision({
    id: LEGACY_DIRECTION_ID,
    statement: raw.statement,
    supersedes: null,
    atmosphere: null,
    deletedAt: null,
    createdAt: earlier(now, updatedAt),
    updatedAt,
  });
}

/**
 * Repairs a revision dated later than its own last modification.
 *
 * Under append-only that state is impossible: a revision is immutable, so
 * `updatedAt` can only ever move forward from `createdAt`. Where the reverse
 * appears, the record predates append-only and was stamped by an import that
 * wrote its own run time into `createdAt` while carrying the real edit time
 * through in `updatedAt`.
 *
 * Returns a corrected revision, or null when there is nothing to correct —
 * which is what makes it safe to call on every record and makes the repair
 * idempotent: once applied, it never fires again.
 *
 * A fabricated date in the archive is a small forgery, and this is the one
 * place it could otherwise have been frozen in permanently as "the first
 * thing they believed".
 */
export function repairFabricatedDate(revision: DirectionRevision): DirectionRevision | null {
  if (revision.createdAt.localeCompare(revision.updatedAt) <= 0) {
    return null;
  }

  return directionRevision({ ...revision, createdAt: revision.updatedAt });
}
