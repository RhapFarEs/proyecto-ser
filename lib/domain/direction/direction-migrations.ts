import { LEGACY_DIRECTION_ID, type DirectionRevision } from "./direction";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * The earliest moment we can honestly claim the person wrote something.
 *
 * The pre-append-only import stamped `createdAt` with the time of the
 * *import*, not the time of writing, while carrying the real edit time
 * through in `updatedAt`. Taking the earlier of the two recovers the truth
 * where it survived, and changes nothing everywhere else: revisions are
 * immutable, so for every record written from now on the two are equal.
 *
 * A fabricated date in the archive is a small forgery, and this is the one
 * place it could have been frozen in permanently as "the first thing they
 * believed".
 */
function earliest(createdAt: string, updatedAt: string): string {
  return createdAt.localeCompare(updatedAt) <= 0 ? createdAt : updatedAt;
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
 */
export function normalizeDirectionRevision(raw: unknown): DirectionRevision | null {
  if (!isRecord(raw)) {
    return null;
  }

  const createdAt = readString(raw.createdAt) ?? new Date().toISOString();
  const updatedAt = readString(raw.updatedAt) ?? createdAt;

  return Object.freeze({
    id: readString(raw.id) ?? LEGACY_DIRECTION_ID,
    statement: typeof raw.statement === "string" ? raw.statement : "",
    supersedes: readString(raw.supersedes),
    atmosphere: readString(raw.atmosphere),
    deletedAt: readString(raw.deletedAt),
    createdAt: earliest(createdAt, updatedAt),
    updatedAt,
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
 */
export function parseLegacyDirection(raw: unknown, now: string): DirectionRevision | null {
  if (!isRecord(raw) || typeof raw.statement !== "string") {
    return null;
  }

  const updatedAt = readString(raw.updatedAt) ?? now;

  return Object.freeze({
    id: LEGACY_DIRECTION_ID,
    statement: raw.statement,
    supersedes: null,
    atmosphere: null,
    deletedAt: null,
    createdAt: earliest(now, updatedAt),
    updatedAt,
  });
}
