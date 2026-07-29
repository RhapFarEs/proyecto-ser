/**
 * Append-only revision semantics, for any domain that has them.
 *
 * CONSTITUTION.md, Second Law corollary: nothing meaningful is ever
 * overwritten — revision appends. This module is where that rule lives, so
 * that every domain implementing it implements the same one.
 *
 * The atom is not the revision. The atom is an immutable piece of authored
 * text; `supersedes` is one relationship between two atoms. That matters for
 * what comes later: a second relationship (which entries belong together)
 * is another edge over the same atoms, never a parallel archive.
 *
 * A note for whoever is tempted, and someone will be: this is deliberately
 * NOT event sourcing. Each revision stores the whole statement, not a delta,
 * so every stored row is independently meaningful and readable without this
 * application — which is what the Fourth Law's export guarantee requires. A
 * fold-the-deltas design would make the archive a projection, and the archive
 * has to be the truth.
 *
 * This file must never import anything. It is pure by contract: no storage,
 * no sync, no browser, no domain. That is what makes every invariant below
 * testable without a DOM, and what stops it becoming a helper for one caller.
 */

/**
 * The minimum a record needs to take part in a revision chain. Deliberately
 * the smallest possible surface — no text field, no atmosphere, nothing this
 * module does not actually read. Domains extend it with what they hold.
 */
export interface Revision {
  readonly id: string;
  /** The revision this one replaces. Null means the beginning of a chain. */
  readonly supersedes: string | null;
  readonly createdAt: string;
  /** Hidden from display, never removed from the record. */
  readonly deletedAt: string | null;
}

/**
 * Newest first, deterministically.
 *
 * Timestamps can collide — two saves inside the same millisecond, or two
 * devices with clocks that agree too well — so `id` breaks ties. Without
 * that, the "current" statement could differ between two devices holding
 * byte-identical data, which is the kind of bug that takes a week to find.
 *
 * Copies before sorting: callers pass arrays owned by a store, and sorting
 * in place would reorder someone else's state as a side effect.
 */
function sortNewestFirst<T extends Revision>(revisions: readonly T[]): T[] {
  return [...revisions].sort((a, b) => {
    const byTime = b.createdAt.localeCompare(a.createdAt);

    return byTime !== 0 ? byTime : b.id.localeCompare(a.id);
  });
}

/** Live revisions, newest first. Tombstones are excluded from display only. */
export function listLive<T extends Revision>(revisions: readonly T[]): T[] {
  return sortNewestFirst(revisions.filter((revision) => !revision.deletedAt));
}

/**
 * The revision that is currently true, or null if there is none.
 *
 * Resolution follows the chain rather than the clock. The head — the
 * revision nothing else supersedes — wins even when its timestamp is older,
 * because two devices with skewed clocks will disagree about time and agree
 * about the chain.
 *
 * Only *live* revisions can supersede. Deleting a revision therefore restores
 * the one before it, which is what a person means when they remove something
 * they wrote: not "erase my history", but "that is no longer what I think".
 *
 * There is no traversal here, and that is on purpose. An earlier design
 * walked from the head down through `supersedes`, which meant a cyclic chain
 * — only reachable through corruption or a future bug — could hang the tab,
 * guarded by a visited set. Resolving by set membership instead removes the
 * hazard by construction rather than defending against it.
 *
 * A cycle can still leave no head at all. Rather than return null and blank
 * the screen over data that is completely intact, fall back to the newest
 * live revision: degraded ordering is recoverable, an apparently empty
 * archive is alarming.
 */
export function resolveCurrent<T extends Revision>(revisions: readonly T[]): T | null {
  const live = listLive(revisions);

  if (live.length === 0) {
    return null;
  }

  const superseded = new Set<string>();

  for (const revision of live) {
    if (revision.supersedes !== null) {
      superseded.add(revision.supersedes);
    }
  }

  const heads = live.filter((revision) => !superseded.has(revision.id));

  return (heads.length > 0 ? heads : live)[0] ?? null;
}

/**
 * Whether a new revision should be written at all.
 *
 * Append-only makes every save permanent, so the guards here are what stop a
 * history from filling with noise: re-saving unchanged text, or saving
 * nothing at all. Both are silent no-ops — the person still sees "Guardado",
 * because from where they sit their words *are* saved.
 *
 * Empty text never appends. A blank statement is not a belief, and someone
 * clearing the field is removing something rather than asserting emptiness.
 */
export function shouldAppend(currentText: string | null, nextText: string): boolean {
  const next = nextText.trim();

  if (next.length === 0) {
    return false;
  }

  return next !== (currentText ?? "").trim();
}
