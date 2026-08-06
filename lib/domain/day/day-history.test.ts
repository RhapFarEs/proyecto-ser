import { describe, expect, it } from "vitest";

import { createDay, type Day } from "./day";
import { buildJournalHistory, groupJournalNotesByDayKey } from "./day-history";
import type { JournalNote } from "@/lib/domain/journal/journal";

function note(id: string, dayKey: string, createdAt: string, content = "algo"): JournalNote {
  return {
    id,
    dayKey,
    mood: "",
    content,
    deletedAt: null,
    createdAt: `${createdAt}.000Z`,
    updatedAt: `${createdAt}.000Z`,
  };
}

function day(date: string): Day {
  return { ...createDay(date), id: date };
}

describe("grouping notes by day", () => {
  it("puts each note under the day it was written on", () => {
    const grouped = groupJournalNotesByDayKey([
      note("a", "2026-03-01", "2026-03-01T09:00:00"),
      note("b", "2026-03-02", "2026-03-02T09:00:00"),
      note("c", "2026-03-01", "2026-03-01T21:00:00"),
    ]);

    expect(grouped.get("2026-03-01")?.map((entry) => entry.id)).toEqual(["a", "c"]);
    expect(grouped.get("2026-03-02")?.map((entry) => entry.id)).toEqual(["b"]);
  });

  it("keeps each day in the order the notes were written", () => {
    // The store hands notes back newest first; a day should still read
    // downwards the way it was lived.
    const grouped = groupJournalNotesByDayKey([
      note("evening", "2026-03-01", "2026-03-01T22:00:00"),
      note("morning", "2026-03-01", "2026-03-01T07:00:00"),
    ]);

    expect(grouped.get("2026-03-01")?.map((entry) => entry.id)).toEqual([
      "morning",
      "evening",
    ]);
  });

  it("says nothing about a day with no notes", () => {
    const grouped = groupJournalNotesByDayKey([note("a", "2026-03-01", "2026-03-01T09:00:00")]);

    expect(grouped.get("2026-03-02")).toBeUndefined();
  });

  it("holds up with nothing written yet", () => {
    expect(groupJournalNotesByDayKey([]).size).toBe(0);
  });

  it("gives the same answer as asking one day at a time", () => {
    // The whole point of the index: it must not quietly show a different
    // history than the per-day read it replaced.
    const notes = [
      note("a", "2026-03-01", "2026-03-01T09:00:00", "primera"),
      note("b", "2026-03-01", "2026-03-01T18:00:00", "segunda"),
    ];

    const grouped = groupJournalNotesByDayKey(notes);
    const perDay = notes
      .filter((item) => item.dayKey === "2026-03-01")
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .map((item) => item.content);

    expect(grouped.get("2026-03-01")?.map((entry) => entry.content)).toEqual(perDay);
  });
});

describe("building the history list", () => {
  it("shows the most recent day first", () => {
    const days = [day("2026-03-01"), day("2026-03-03"), day("2026-03-02")];
    const grouped = groupJournalNotesByDayKey([
      note("a", "2026-03-01", "2026-03-01T09:00:00"),
      note("b", "2026-03-02", "2026-03-02T09:00:00"),
      note("c", "2026-03-03", "2026-03-03T09:00:00"),
    ]);

    expect(buildJournalHistory(days, grouped).map((item) => item.day.date)).toEqual([
      "2026-03-03",
      "2026-03-02",
      "2026-03-01",
    ]);
  });

  it("leaves out days where nothing was written", () => {
    const grouped = groupJournalNotesByDayKey([
      note("a", "2026-03-02", "2026-03-02T09:00:00"),
    ]);

    expect(
      buildJournalHistory([day("2026-03-01"), day("2026-03-02")], grouped).map(
        (item) => item.day.date,
      ),
    ).toEqual(["2026-03-02"]);
  });

  it("leaves out a day that holds no notes at all", () => {
    // Nothing else can put a day in this list: the only thing history shows
    // is what was written into it.
    expect(buildJournalHistory([day("2026-03-01")], new Map())).toEqual([]);
  });

  it("carries each day's own notes", () => {
    const grouped = groupJournalNotesByDayKey([
      note("a", "2026-03-01", "2026-03-01T09:00:00", "lunes"),
      note("b", "2026-03-02", "2026-03-02T09:00:00", "martes"),
    ]);

    const history = buildJournalHistory([day("2026-03-01"), day("2026-03-02")], grouped);

    expect(history[0].notes.map((entry) => entry.content)).toEqual(["martes"]);
    expect(history[1].notes.map((entry) => entry.content)).toEqual(["lunes"]);
  });

  it("does not reorder the days it was given", () => {
    const days = [day("2026-03-01"), day("2026-03-02")];
    const original = days.map((item) => item.date);

    buildJournalHistory(days, new Map());

    expect(days.map((item) => item.date)).toEqual(original);
  });

  it("returns nothing when nothing has been written", () => {
    expect(buildJournalHistory([], new Map())).toEqual([]);
  });
});
