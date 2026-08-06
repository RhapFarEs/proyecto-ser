import { describe, expect, it } from "vitest";

import { getTodayInsight, isReturningAfterAbsence, wroteOn } from "./insight-engine";
import { createDay, type Day } from "@/lib/domain/day/day";
import { createHabitEntry, createJournalEntry } from "@/lib/domain/entry/entry";

function day(date: string, overrides: Partial<Day> = {}): Day {
  return { ...createDay(date), id: date, ...overrides };
}

const NO_NOTES: ReadonlySet<string> = new Set();

/** 8am and 10pm produce different lines from the same day. */
const MORNING = new Date("2026-03-10T08:00:00");
const EVENING = new Date("2026-03-10T22:00:00");

describe("knowing whether something was written", () => {
  it("counts a note held in the note store", () => {
    expect(wroteOn(day("2026-03-10"), new Set(["2026-03-10"]))).toBe(true);
  });

  it("still counts a note left inside an old day record", () => {
    // Days migrated from before notes moved out keep theirs in `entries`.
    const migrated = day("2026-03-10", {
      entries: [createJournalEntry("2026-03-10:journal", "", "Escribí", "")],
    });

    expect(wroteOn(migrated, NO_NOTES)).toBe(true);
  });

  it("says no when the day holds nothing", () => {
    expect(wroteOn(day("2026-03-10"), new Set(["2026-03-09"]))).toBe(false);
  });
});

describe("greeting someone as returning", () => {
  it("does not call it a return when writing is all they did yesterday", () => {
    /*
      The bug this covers. Notes moved to their own store, so a day spent
      only writing looked completely empty. The last day this person was
      "present" was read as January, months back, and someone who had
      written yesterday was welcomed back as if they had disappeared.

      The long-ago day is what makes this discriminating: without it there
      is no previous presence at all and the answer is false either way.
    */
    const history = [day("2026-01-01", { intention: "Algo" }), day("2026-03-09")];

    expect(isReturningAfterAbsence("2026-03-10", history, new Set(["2026-03-09"]))).toBe(false);
  });

  it("does not call it a return on a first day, with nothing behind it", () => {
    expect(isReturningAfterAbsence("2026-03-10", [], NO_NOTES)).toBe(false);
  });

  it("counts an intention as having been here", () => {
    const withIntention = [day("2026-03-09", { intention: "Caminar" })];

    expect(isReturningAfterAbsence("2026-03-10", withIntention, NO_NOTES)).toBe(false);
  });

  it("counts a sustained practice as having been here", () => {
    const withHabit = [
      day("2026-03-09", { entries: [createHabitEntry("h1", "habit-1", true)] }),
    ];

    expect(isReturningAfterAbsence("2026-03-10", withHabit, NO_NOTES)).toBe(false);
  });

  it("does call it a return after a long enough gap", () => {
    const longAgo = [day("2026-01-01", { intention: "Algo" })];

    expect(isReturningAfterAbsence("2026-03-10", longAgo, NO_NOTES)).toBe(true);
  });
});

describe("what the day says back", () => {
  it("welcomes someone back only when they have not written today", () => {
    const longAgo = [day("2026-01-01", { intention: "Algo" })];

    expect(getTodayInsight(day("2026-03-10"), [], MORNING, longAgo, NO_NOTES)?.id).toBe(
      "welcome-back",
    );
  });

  it("does not welcome back someone who already wrote today", () => {
    const longAgo = [day("2026-01-01", { intention: "Algo" })];
    const today = new Set(["2026-03-10"]);

    expect(getTodayInsight(day("2026-03-10"), [], MORNING, longAgo, today)?.id).not.toBe(
      "welcome-back",
    );
  });

  it("acknowledges writing done today", () => {
    const insight = getTodayInsight(
      day("2026-03-10"),
      [],
      MORNING,
      [],
      new Set(["2026-03-10"]),
    );

    expect(insight?.id).toBe("journal-written-today");
  });

  it("asks an evening question about what was written", () => {
    const insight = getTodayInsight(
      day("2026-03-10"),
      [],
      EVENING,
      [],
      new Set(["2026-03-10"]),
    );

    expect(insight?.id).toBe("evening-journal-question");
  });

  it("prefers this morning's intention in the evening", () => {
    const insight = getTodayInsight(
      day("2026-03-10", { intention: "Caminar despacio" }),
      [],
      EVENING,
      [],
      new Set(["2026-03-10"]),
    );

    expect(insight?.id).toBe("evening-intention-question");
  });

  it("says nothing rather than inventing something on an empty first day", () => {
    expect(getTodayInsight(day("2026-03-10"), [], MORNING, [], NO_NOTES)).toBeNull();
  });
});
