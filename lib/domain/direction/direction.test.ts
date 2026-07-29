import { describe, expect, it } from "vitest";

import { resolveCurrent } from "@/lib/domain/revisions/revision";
import {
  appendDirectionRevision,
  directionRevision,
  LEGACY_DIRECTION_ID,
  type DirectionRevision,
} from "./direction";
import {
  normalizeDirectionRevision,
  parseLegacyDirection,
  repairFabricatedDate,
} from "./direction-migrations";

const NOW = "2026-07-29T10:00:00.000Z";

function revision(overrides: Partial<DirectionRevision> & { id: string }): DirectionRevision {
  return directionRevision({
    statement: "algo",
    supersedes: null,
    atmosphere: null,
    deletedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  });
}

const context = { id: "new", now: NOW, atmosphere: "alba" };

/**
 * The behaviour the whole change exists to guarantee. Previously only the
 * pieces were covered — resolution, the append guard, construction — while
 * the function that composes them was untested, so a transposed argument
 * would have passed the entire suite.
 */
describe("appendDirectionRevision", () => {
  it("starts a chain when nothing has been written", () => {
    const appended = appendDirectionRevision([], "Caminar despacio", context);

    expect(appended).toEqual({
      id: "new",
      statement: "Caminar despacio",
      supersedes: null,
      atmosphere: "alba",
      deletedAt: null,
      createdAt: NOW,
      updatedAt: NOW,
    });
  });

  it("points the new revision at the one it replaces", () => {
    const first = revision({ id: "a", statement: "Caminar despacio" });

    const appended = appendDirectionRevision([first], "Caminar sin prisa", context);

    expect(appended?.supersedes).toBe("a");
    expect(appended?.statement).toBe("Caminar sin prisa");
  });

  it("leaves every earlier revision exactly as it was", () => {
    const first = revision({
      id: "a",
      statement: "Caminar despacio",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    appendDirectionRevision([first], "Caminar sin prisa", context);

    expect(first).toEqual({
      id: "a",
      statement: "Caminar despacio",
      supersedes: null,
      atmosphere: null,
      deletedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("supersedes the current revision, not the newest one", () => {
    // The chain head carries the older timestamp, which is what happens when
    // two devices disagree about the time. Appending onto the newest by date
    // would fork the chain and lose the intervening statement from view.
    const first = revision({ id: "a", createdAt: "2026-06-01T00:00:00.000Z" });
    const second = revision({ id: "b", supersedes: "a", createdAt: "2026-01-01T00:00:00.000Z" });

    const appended = appendDirectionRevision([first, second], "otra cosa", context);

    expect(appended?.supersedes).toBe("b");
  });

  it("appends onto the restored predecessor after a deletion", () => {
    const first = revision({ id: "a", statement: "primera" });
    const second = revision({
      id: "b",
      statement: "segunda",
      supersedes: "a",
      createdAt: "2026-08-01T00:00:00.000Z",
      deletedAt: "2026-09-01T00:00:00.000Z",
    });

    const appended = appendDirectionRevision([first, second], "tercera", context);

    expect(appended?.supersedes).toBe("a");
  });

  it("writes nothing when the text has not changed", () => {
    const first = revision({ id: "a", statement: "Caminar despacio" });

    expect(appendDirectionRevision([first], "Caminar despacio", context)).toBeNull();
    expect(appendDirectionRevision([first], "  Caminar despacio \n", context)).toBeNull();
  });

  it("writes nothing for empty or blank text", () => {
    const first = revision({ id: "a", statement: "Caminar despacio" });

    expect(appendDirectionRevision([first], "", context)).toBeNull();
    expect(appendDirectionRevision([first], "   \n ", context)).toBeNull();
    expect(appendDirectionRevision([], "", context)).toBeNull();
  });

  it("stores the statement trimmed", () => {
    const appended = appendDirectionRevision([], "  Caminar despacio \n", context);

    expect(appended?.statement).toBe("Caminar despacio");
  });

  it("records no atmosphere when the caller has none to give", () => {
    const appended = appendDirectionRevision([], "Caminar despacio", {
      ...context,
      atmosphere: null,
    });

    expect(appended?.atmosphere).toBeNull();
  });

  it("produces a chain that resolves to the new revision", () => {
    const first = revision({ id: "a", statement: "primera" });
    const appended = appendDirectionRevision([first], "segunda", context);

    expect(resolveCurrent([first, appended!])).toBe(appended);
  });

  it("does not mutate the revisions it is given", () => {
    const first = revision({ id: "a" });
    const revisions = [first];

    appendDirectionRevision(revisions, "otra cosa", context);

    expect(revisions).toEqual([first]);
  });
});

describe("directionRevision", () => {
  it("cannot be mutated after it is created", () => {
    const created = revision({ id: "a", statement: "Caminar despacio" });

    expect(() => {
      (created as unknown as { statement: string }).statement = "otra cosa";
    }).toThrow();

    expect(created.statement).toBe("Caminar despacio");
  });
});

describe("normalizeDirectionRevision", () => {
  it("reads the id from the record", () => {
    // Regression guard. This function used to hardcode the singleton id and
    // ignore the record entirely, which under append-only would collapse
    // every revision onto one id on the first read and destroy the history.
    const a = normalizeDirectionRevision({ id: "a", statement: "primera", createdAt: NOW });
    const b = normalizeDirectionRevision({
      id: "b",
      statement: "segunda",
      supersedes: "a",
      createdAt: NOW,
    });

    expect(a?.id).toBe("a");
    expect(b?.id).toBe("b");
    expect(b?.supersedes).toBe("a");
  });

  it("restores a record exactly as stored, correcting nothing", () => {
    // Both read paths must agree. An earlier version repaired dates here but
    // not in `fromRow`, so the same revision had different dates depending on
    // whether it came from localStorage or Supabase.
    const stored = {
      id: "a",
      statement: "primera",
      atmosphere: "piedra",
      supersedes: null,
      deletedAt: null,
      createdAt: "2026-07-14T00:00:00.000Z",
      updatedAt: "2026-03-02T00:00:00.000Z",
    };

    expect(normalizeDirectionRevision(stored)).toEqual(stored);
  });

  it("treats a record with no atmosphere as having none, not a default", () => {
    const restored = normalizeDirectionRevision({ id: "a", statement: "primera", createdAt: NOW });

    expect(restored?.atmosphere).toBeNull();
  });

  it("falls back to the legacy id for records written before ids existed", () => {
    const restored = normalizeDirectionRevision({ statement: "primera", createdAt: NOW });

    expect(restored?.id).toBe(LEGACY_DIRECTION_ID);
  });

  it("preserves tombstones", () => {
    const restored = normalizeDirectionRevision({
      id: "a",
      statement: "primera",
      deletedAt: "2026-05-01T00:00:00.000Z",
      createdAt: NOW,
    });

    expect(restored?.deletedAt).toBe("2026-05-01T00:00:00.000Z");
  });

  it("rejects values that are not records", () => {
    expect(normalizeDirectionRevision(null)).toBeNull();
    expect(normalizeDirectionRevision("texto")).toBeNull();
    expect(normalizeDirectionRevision([])).toBeNull();
  });

  it("returns a frozen revision", () => {
    const restored = normalizeDirectionRevision({ id: "a", statement: "primera", createdAt: NOW });

    expect(Object.isFrozen(restored)).toBe(true);
  });
});

describe("parseLegacyDirection", () => {
  it("turns the oldest flat shape into a first revision", () => {
    const imported = parseLegacyDirection(
      { statement: "Caminar despacio", updatedAt: "2026-03-02T00:00:00.000Z" },
      NOW,
    );

    expect(imported).toEqual({
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
    expect(parseLegacyDirection({ statement: "Caminar despacio" }, NOW)?.createdAt).toBe(NOW);
  });

  it("ignores anything that is not a legacy statement", () => {
    expect(parseLegacyDirection(null, NOW)).toBeNull();
    expect(parseLegacyDirection({ updatedAt: NOW }, NOW)).toBeNull();
    expect(parseLegacyDirection({ statement: 42 }, NOW)).toBeNull();
  });

  it("does not mistake the current entity shape for the legacy one", () => {
    // The current localStorage value is a Record<id, entity>, which has no
    // top-level `statement`. Misreading it would fabricate a revision.
    expect(parseLegacyDirection({ a: { id: "a", statement: "primera" } }, NOW)).toBeNull();
  });
});

describe("repairFabricatedDate", () => {
  it("corrects a revision dated after its own last modification", () => {
    const stamped = revision({
      id: LEGACY_DIRECTION_ID,
      createdAt: "2026-07-14T00:00:00.000Z",
      updatedAt: "2026-03-02T00:00:00.000Z",
    });

    expect(repairFabricatedDate(stamped)?.createdAt).toBe("2026-03-02T00:00:00.000Z");
  });

  it("leaves everything else about the revision alone", () => {
    const stamped = revision({
      id: LEGACY_DIRECTION_ID,
      statement: "Caminar despacio",
      atmosphere: "tinta",
      createdAt: "2026-07-14T00:00:00.000Z",
      updatedAt: "2026-03-02T00:00:00.000Z",
    });

    const repaired = repairFabricatedDate(stamped);

    expect(repaired?.statement).toBe("Caminar despacio");
    expect(repaired?.atmosphere).toBe("tinta");
    expect(repaired?.updatedAt).toBe("2026-03-02T00:00:00.000Z");
  });

  it("reports nothing to do for an ordinary revision", () => {
    expect(repairFabricatedDate(revision({ id: "a" }))).toBeNull();
    expect(
      repairFabricatedDate(
        revision({ id: "a", createdAt: NOW, updatedAt: "2026-09-01T00:00:00.000Z" }),
      ),
    ).toBeNull();
  });

  it("is idempotent, so running the repair again is free", () => {
    const stamped = revision({
      id: LEGACY_DIRECTION_ID,
      createdAt: "2026-07-14T00:00:00.000Z",
      updatedAt: "2026-03-02T00:00:00.000Z",
    });

    const once = repairFabricatedDate(stamped);

    expect(repairFabricatedDate(once!)).toBeNull();
  });
});
