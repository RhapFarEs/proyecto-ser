import { describe, expect, it } from "vitest";

import { resolveCurrent } from "@/lib/domain/revisions/revision";
import { createDirectionRevision, LEGACY_DIRECTION_ID } from "./direction";
import { normalizeDirectionRevision, parseLegacyDirection } from "./direction-migrations";

const NOW = "2026-07-29T10:00:00.000Z";

describe("createDirectionRevision", () => {
  it("records the statement, its place, and what it replaces", () => {
    const revision = createDirectionRevision({
      id: "b",
      now: NOW,
      statement: "Caminar sin prisa",
      supersedes: "a",
      atmosphere: "alba",
    });

    expect(revision).toEqual({
      id: "b",
      statement: "Caminar sin prisa",
      supersedes: "a",
      atmosphere: "alba",
      deletedAt: null,
      createdAt: NOW,
      updatedAt: NOW,
    });
  });

  it("cannot be mutated after it is created", () => {
    const revision = createDirectionRevision({
      id: "a",
      now: NOW,
      statement: "Caminar despacio",
      supersedes: null,
      atmosphere: "tinta",
    });

    expect(() => {
      (revision as unknown as { statement: string }).statement = "otra cosa";
    }).toThrow();

    expect(revision.statement).toBe("Caminar despacio");
  });

  it("leaves the revision it supersedes untouched", () => {
    // The whole point of the sprint: writing something new must never reach
    // back and change what was written before.
    const first = createDirectionRevision({
      id: "a",
      now: "2026-01-01T00:00:00.000Z",
      statement: "Caminar despacio",
      supersedes: null,
      atmosphere: "tinta",
    });

    const second = createDirectionRevision({
      id: "b",
      now: NOW,
      statement: "Caminar sin prisa",
      supersedes: first.id,
      atmosphere: "papel",
    });

    expect(first.statement).toBe("Caminar despacio");
    expect(first.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(resolveCurrent([first, second])).toBe(second);
  });
});

describe("normalizeDirectionRevision", () => {
  it("reads the id from the record", () => {
    // Regression guard. This function used to hardcode the singleton id and
    // ignore the record entirely, which under append-only would collapse
    // every revision onto one id on the first read and destroy the history.
    const a = normalizeDirectionRevision({
      id: "a",
      statement: "primera",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const b = normalizeDirectionRevision({
      id: "b",
      statement: "segunda",
      supersedes: "a",
      createdAt: "2026-02-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
    });

    expect(a?.id).toBe("a");
    expect(b?.id).toBe("b");
    expect(b?.supersedes).toBe("a");
  });

  it("carries the atmosphere through unchanged", () => {
    const revision = normalizeDirectionRevision({
      id: "a",
      statement: "primera",
      atmosphere: "piedra",
      createdAt: NOW,
      updatedAt: NOW,
    });

    expect(revision?.atmosphere).toBe("piedra");
  });

  it("treats a record with no atmosphere as having none, not a default", () => {
    // Guessing where someone was is worse than admitting we do not know.
    const revision = normalizeDirectionRevision({
      id: "a",
      statement: "primera",
      createdAt: NOW,
      updatedAt: NOW,
    });

    expect(revision?.atmosphere).toBeNull();
  });

  it("falls back to the legacy id for records written before ids existed", () => {
    const revision = normalizeDirectionRevision({
      statement: "primera",
      createdAt: NOW,
      updatedAt: NOW,
    });

    expect(revision?.id).toBe(LEGACY_DIRECTION_ID);
  });

  it("dates a revision from the earliest evidence available", () => {
    // The pre-append-only import stamped createdAt with the import time
    // while carrying the real edit time in updatedAt. Preferring the earlier
    // of the two keeps a fabricated date out of the archive.
    const revision = normalizeDirectionRevision({
      id: "direction",
      statement: "primera",
      createdAt: "2026-07-14T00:00:00.000Z",
      updatedAt: "2026-03-02T00:00:00.000Z",
    });

    expect(revision?.createdAt).toBe("2026-03-02T00:00:00.000Z");
  });

  it("leaves ordinary revisions dated exactly as written", () => {
    const revision = normalizeDirectionRevision({
      id: "a",
      statement: "primera",
      createdAt: "2026-03-02T00:00:00.000Z",
      updatedAt: "2026-07-14T00:00:00.000Z",
    });

    expect(revision?.createdAt).toBe("2026-03-02T00:00:00.000Z");
  });

  it("preserves tombstones", () => {
    const revision = normalizeDirectionRevision({
      id: "a",
      statement: "primera",
      deletedAt: "2026-05-01T00:00:00.000Z",
      createdAt: NOW,
      updatedAt: NOW,
    });

    expect(revision?.deletedAt).toBe("2026-05-01T00:00:00.000Z");
  });

  it("rejects values that are not records", () => {
    expect(normalizeDirectionRevision(null)).toBeNull();
    expect(normalizeDirectionRevision("texto")).toBeNull();
    expect(normalizeDirectionRevision([])).toBeNull();
  });

  it("returns a frozen revision", () => {
    const revision = normalizeDirectionRevision({
      id: "a",
      statement: "primera",
      createdAt: NOW,
      updatedAt: NOW,
    });

    expect(Object.isFrozen(revision)).toBe(true);
  });
});

describe("parseLegacyDirection", () => {
  it("turns the oldest flat shape into a first revision", () => {
    const revision = parseLegacyDirection(
      { statement: "Caminar despacio", updatedAt: "2026-03-02T00:00:00.000Z" },
      NOW,
    );

    expect(revision).toEqual({
      id: LEGACY_DIRECTION_ID,
      statement: "Caminar despacio",
      supersedes: null,
      atmosphere: null,
      deletedAt: null,
      createdAt: "2026-03-02T00:00:00.000Z",
      updatedAt: "2026-03-02T00:00:00.000Z",
    });
  });

  it("dates an undated legacy statement from the import", () => {
    const revision = parseLegacyDirection({ statement: "Caminar despacio" }, NOW);

    expect(revision?.createdAt).toBe(NOW);
  });

  it("ignores anything that is not a legacy statement", () => {
    expect(parseLegacyDirection(null, NOW)).toBeNull();
    expect(parseLegacyDirection({ updatedAt: NOW }, NOW)).toBeNull();
    expect(parseLegacyDirection({ statement: 42 }, NOW)).toBeNull();
  });

  it("does not mistake the current entity shape for the legacy one", () => {
    // The current localStorage value is a Record<id, entity>, which has no
    // top-level `statement`. Misreading it would fabricate a revision.
    const currentShape = { a: { id: "a", statement: "primera" } };

    expect(parseLegacyDirection(currentShape, NOW)).toBeNull();
  });
});
