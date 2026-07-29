import { describe, expect, it } from "vitest";

import { addDaysToKey } from "@/lib/date";
import { selectEcho, type EchoSource } from "./echo";

/** Long enough to clear MIN_TEXT_LENGTH without being about anything. */
const SENTENCE = "Quiero caminar más despacio esta semana";

function source(id: string, dateKey: string, text: string = SENTENCE): EchoSource {
  return { id, dateKey, text };
}

/** The first day on or after `fromKey` that produces an echo, or null. */
function firstEchoWithin(sources: EchoSource[], fromKey: string, days: number): number | null {
  for (let offset = 1; offset <= days; offset += 1) {
    if (selectEcho(sources, addDaysToKey(fromKey, offset))) {
      return offset;
    }
  }

  return null;
}

describe("what is eligible to come back", () => {
  it("returns nothing when the person has written nothing", () => {
    expect(selectEcho([], "2026-03-01")).toBeNull();
  });

  it("never echoes something written today", () => {
    expect(selectEcho([source("a", "2026-03-01")], "2026-03-01")).toBeNull();
  });

  it("never echoes something dated in the future", () => {
    expect(selectEcho([source("a", "2026-04-01")], "2026-03-01")).toBeNull();
  });

  it("waits until a memory is old enough to have faded", () => {
    const written = [source("a", "2026-03-01")];

    // Thirteen days is still this week's thinking; fourteen is a fortnight ago.
    expect(selectEcho(written, addDaysToKey("2026-03-01", 13))).toBeNull();
    expect(selectEcho(written, addDaysToKey("2026-03-01", 14))).not.toBeNull();
  });

  it("leaves out fragments too short to meet again", () => {
    // "Descansar" is a fine intention and a poor echo.
    const written = [source("a", "2026-03-01", "Descansar")];

    expect(firstEchoWithin(written, "2026-03-01", 40)).toBeNull();
  });

  it("does not judge a memory by what it is about", () => {
    // A mundane errand is as eligible as a reflection. SER never decides
    // whether a memory deserves to return — see CONSTITUTION.md. This is the
    // note that means nothing at two weeks and everything at four years.
    const errand = [source("a", "2026-03-01", "Comprar pan para mi madre")];

    expect(selectEcho(errand, addDaysToKey("2026-03-01", 14))).not.toBeNull();
  });
});

describe("the rhythm belongs to the person", () => {
  it("returns something within a fortnight of writing, whatever day they arrive", () => {
    // The criterion for the whole sprint, checked across an entire year of
    // possible start dates. The previous gate keyed on the day of the *year*
    // being divisible by seven, so this held for some start dates and not
    // others; the wait was decided by the calendar rather than by the person.
    const waits: number[] = [];

    for (let offset = 0; offset < 365; offset += 1) {
      const startKey = addDaysToKey("2026-01-01", offset);
      const wait = firstEchoWithin([source("a", startKey)], startKey, 30);

      expect(wait, `no echo within 30 days for a start on ${startKey}`).not.toBeNull();
      waits.push(wait!);
    }

    expect(Math.max(...waits)).toBeLessThanOrEqual(14);
  });

  it("keeps roughly a weekly rhythm after the first one", () => {
    const startKey = "2026-03-01";
    const written = [source("a", startKey)];
    const echoDays: number[] = [];

    for (let offset = 14; offset <= 42; offset += 1) {
      if (selectEcho(written, addDaysToKey(startKey, offset))) {
        echoDays.push(offset);
      }
    }

    expect(echoDays).toEqual([14, 21, 28, 35, 42]);
  });

  it("counts from the first thing written, not from the calendar", () => {
    // Two people writing the same sentence on different days should each get
    // their own rhythm, not a shared one.
    const early = [source("a", "2026-03-01")];
    const late = [source("a", "2026-03-04")];

    expect(selectEcho(early, addDaysToKey("2026-03-01", 14))).not.toBeNull();
    expect(selectEcho(late, addDaysToKey("2026-03-01", 14))).toBeNull();
    expect(selectEcho(late, addDaysToKey("2026-03-04", 14))).not.toBeNull();
  });

  it("anchors on the earliest entry even when that entry can never be echoed", () => {
    // The first thing written is too short to qualify, but it is still when
    // this person started, so it is still what the rhythm counts from.
    //
    // Anchored on the first *source* (Mar 1), the rhythm falls on Mar 8, 15,
    // 22 — and the qualifying entry only becomes old enough on Mar 16, so the
    // first echo is Mar 22. Anchored on the first *candidate* (Mar 2) instead,
    // the rhythm would fall on Mar 16 and the echo would arrive six days
    // earlier. Checking both days pins down which anchor is in use.
    const written = [source("short", "2026-03-01", "Hoy"), source("a", "2026-03-02")];

    expect(selectEcho(written, "2026-03-16")).toBeNull();
    expect(selectEcho(written, "2026-03-22")).not.toBeNull();
  });
});

describe("anniversaries", () => {
  it("come back on the day regardless of the rhythm", () => {
    const written = [source("a", "2025-06-15")];

    const echo = selectEcho(written, "2026-06-15");

    expect(echo?.kind).toBe("anniversary");
    expect(echo?.yearsAgo).toBe(1);
  });

  it("prefer the nearer year when several land on the same day", () => {
    const written = [
      source("old", "2022-06-15", "Lo que escribí hace cuatro años"),
      source("recent", "2025-06-15", "Lo que escribí hace un año"),
    ];

    expect(selectEcho(written, "2026-06-15")?.id).toBe("recent");
  });

  it("are not claimed by something written earlier the same year", () => {
    const written = [source("a", "2026-06-15")];

    expect(selectEcho(written, "2026-06-15")).toBeNull();
  });
});

describe("the same day gives the same memory", () => {
  it("returns an identical echo for identical inputs", () => {
    const written = [source("a", "2026-03-01"), source("b", "2026-03-02")];
    const todayKey = addDaysToKey("2026-03-01", 21);

    expect(selectEcho(written, todayKey)).toEqual(selectEcho(written, todayKey));
  });

  it("does not depend on the order storage happened to return", () => {
    // The guarantee that used to be claimed and did not hold: `pickStable`
    // indexes into the candidate array, and the stores return newest-first,
    // so writing anything new reordered the array and silently swapped the
    // echo already shown that morning.
    const a = source("a", "2026-03-01", "La primera cosa que escribí");
    const b = source("b", "2026-03-02", "La segunda cosa que escribí");
    const todayKey = addDaysToKey("2026-03-01", 21);

    expect(selectEcho([a, b], todayKey)).toEqual(selectEcho([b, a], todayKey));
  });

  it("keeps today's echo when something new is written today", () => {
    const written = [source("a", "2026-03-01"), source("b", "2026-03-02")];
    const todayKey = addDaysToKey("2026-03-01", 21);
    const before = selectEcho(written, todayKey);

    const after = selectEcho([...written, source("new", todayKey, "Escrito hoy mismo")], todayKey);

    expect(after).toEqual(before);
  });

  it("does not reorder the array it is given", () => {
    const written = [source("b", "2026-03-02"), source("a", "2026-03-01")];

    selectEcho(written, addDaysToKey("2026-03-01", 21));

    expect(written.map((entry) => entry.id)).toEqual(["b", "a"]);
  });
});
