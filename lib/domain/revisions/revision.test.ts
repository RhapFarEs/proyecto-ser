import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { listLive, resolveCurrent, shouldAppend, type Revision } from "./revision";

describe("the engine is a primitive, not a helper", () => {
  it("imports nothing at all", () => {
    // An architectural fitness check rather than a behavioural one. The value
    // of this module is that any domain can adopt it; one import of a
    // storage layer, a browser API, or the domain that happens to use it
    // first would quietly turn it into Direction's private helper. Asserting
    // it here means the boundary cannot erode without a failing test.
    const source = readFileSync(fileURLToPath(new URL("./revision.ts", import.meta.url)), "utf8");
    const imports = source.match(/^\s*import\s/gm) ?? [];

    expect(imports).toEqual([]);
  });
});

function rev(
  id: string,
  createdAt: string,
  supersedes: string | null = null,
  deletedAt: string | null = null,
): Revision {
  return { id, createdAt, supersedes, deletedAt };
}

describe("resolveCurrent", () => {
  it("returns null when there is nothing written", () => {
    expect(resolveCurrent([])).toBeNull();
  });

  it("returns the only revision when there is one", () => {
    const first = rev("a", "2026-01-01T00:00:00.000Z");

    expect(resolveCurrent([first])).toBe(first);
  });

  it("follows the chain to the head", () => {
    const first = rev("a", "2026-01-01T00:00:00.000Z");
    const second = rev("b", "2026-02-01T00:00:00.000Z", "a");
    const third = rev("c", "2026-03-01T00:00:00.000Z", "b");

    expect(resolveCurrent([first, third, second])).toBe(third);
  });

  it("trusts the chain over a skewed clock", () => {
    // The successor carries the OLDER timestamp, which is what happens when
    // two devices disagree about the time. Resolving by timestamp would
    // return the superseded statement; resolving by chain does not.
    const first = rev("a", "2026-06-01T00:00:00.000Z");
    const second = rev("b", "2026-01-01T00:00:00.000Z", "a");

    expect(resolveCurrent([first, second])).toBe(second);
  });

  it("survives a successor whose predecessor has not synced yet", () => {
    // Device B pushed the child before the parent arrived. A dangling
    // `supersedes` must not hide the revision that references it.
    const orphan = rev("b", "2026-02-01T00:00:00.000Z", "missing-parent");

    expect(resolveCurrent([orphan])).toBe(orphan);
  });

  it("picks the newest branch when two devices forked from the same revision", () => {
    const first = rev("a", "2026-01-01T00:00:00.000Z");
    const branchA = rev("b", "2026-02-01T00:00:00.000Z", "a");
    const branchB = rev("c", "2026-03-01T00:00:00.000Z", "a");

    expect(resolveCurrent([first, branchA, branchB])).toBe(branchB);
  });

  it("breaks identical timestamps deterministically", () => {
    // Two devices holding byte-identical data must agree on what is current.
    const sameInstant = "2026-02-01T00:00:00.000Z";
    const a = rev("a", sameInstant);
    const b = rev("b", sameInstant);

    expect(resolveCurrent([a, b])).toBe(resolveCurrent([b, a]));
  });

  it("restores the previous statement when the current one is deleted", () => {
    const first = rev("a", "2026-01-01T00:00:00.000Z");
    const second = rev("b", "2026-02-01T00:00:00.000Z", "a", "2026-03-01T00:00:00.000Z");

    expect(resolveCurrent([first, second])).toBe(first);
  });

  it("returns null when everything has been deleted", () => {
    const first = rev("a", "2026-01-01T00:00:00.000Z", null, "2026-03-01T00:00:00.000Z");

    expect(resolveCurrent([first])).toBeNull();
  });

  it("keeps a middle deletion from hiding the revisions around it", () => {
    const first = rev("a", "2026-01-01T00:00:00.000Z");
    const middle = rev("b", "2026-02-01T00:00:00.000Z", "a", "2026-04-01T00:00:00.000Z");
    const last = rev("c", "2026-03-01T00:00:00.000Z", "b");
    const revisions = [first, middle, last];

    expect(resolveCurrent(revisions)).toBe(last);
    expect(listLive(revisions)).toEqual([last, first]);
  });

  it("falls back to the newest revision when a cycle leaves no head", () => {
    // Only reachable through corruption or a future bug. Returning null here
    // would blank the screen over data that is completely intact.
    const a = rev("a", "2026-01-01T00:00:00.000Z", "b");
    const b = rev("b", "2026-02-01T00:00:00.000Z", "a");

    expect(resolveCurrent([a, b])).toBe(b);
  });

  it("does not mutate or reorder the array it is given", () => {
    const first = rev("a", "2026-01-01T00:00:00.000Z");
    const second = rev("b", "2026-02-01T00:00:00.000Z", "a");
    const revisions = [first, second];

    resolveCurrent(revisions);
    listLive(revisions);

    expect(revisions).toEqual([first, second]);
  });
});

describe("listLive", () => {
  it("returns live revisions newest first", () => {
    const first = rev("a", "2026-01-01T00:00:00.000Z");
    const second = rev("b", "2026-02-01T00:00:00.000Z", "a");

    expect(listLive([first, second])).toEqual([second, first]);
  });

  it("hides deleted revisions from display", () => {
    const kept = rev("a", "2026-01-01T00:00:00.000Z");
    const removed = rev("b", "2026-02-01T00:00:00.000Z", "a", "2026-03-01T00:00:00.000Z");

    expect(listLive([kept, removed])).toEqual([kept]);
  });
});

describe("shouldAppend", () => {
  it("appends the first statement", () => {
    expect(shouldAppend(null, "Caminar despacio")).toBe(true);
  });

  it("appends genuinely new text", () => {
    expect(shouldAppend("Caminar despacio", "Caminar sin prisa")).toBe(true);
  });

  it("refuses unchanged text", () => {
    expect(shouldAppend("Caminar despacio", "Caminar despacio")).toBe(false);
  });

  it("refuses text that differs only in surrounding whitespace", () => {
    expect(shouldAppend("Caminar despacio", "  Caminar despacio\n")).toBe(false);
  });

  it("refuses empty text", () => {
    // Clearing the field is removing something, not asserting emptiness, so
    // it must never append a blank statement to the history.
    expect(shouldAppend("Caminar despacio", "")).toBe(false);
    expect(shouldAppend("Caminar despacio", "   \n ")).toBe(false);
    expect(shouldAppend(null, "")).toBe(false);
  });
});
