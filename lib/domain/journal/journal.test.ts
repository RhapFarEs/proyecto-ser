import { describe, expect, it } from "vitest";

import { applyNoteEdit, type JournalNote } from "./journal";

const NOTE: JournalNote = {
  id: "abc123",
  dayKey: "2026-03-01",
  mood: "cansado",
  content: "Hoy me costo concentrarme",
  deletedAt: null,
  createdAt: "2026-03-01T21:04:00.000Z",
  updatedAt: "2026-03-01T21:04:00.000Z",
};

describe("correcting a note", () => {
  it("replaces the words", () => {
    const corrected = applyNoteEdit(NOTE, NOTE.mood, "Hoy me costó concentrarme");

    expect(corrected.content).toBe("Hoy me costó concentrarme");
  });

  it("replaces the mood", () => {
    expect(applyNoteEdit(NOTE, "en paz", NOTE.content).mood).toBe("en paz");
  });

  it("keeps the note's identity", () => {
    // A correction is not a new note. Anything that ever points at this one —
    // today's list, the history, an echo — must still find it afterwards.
    expect(applyNoteEdit(NOTE, "en paz", "otra cosa").id).toBe("abc123");
  });

  it("keeps the moment it was written", () => {
    // Fixing a typo must not move the note to the end of the day.
    const corrected = applyNoteEdit(NOTE, "en paz", "otra cosa");

    expect(corrected.createdAt).toBe("2026-03-01T21:04:00.000Z");
    expect(corrected.dayKey).toBe("2026-03-01");
  });

  it("keeps a tombstone if there is one", () => {
    const removed = { ...NOTE, deletedAt: "2026-03-02T09:00:00.000Z" };

    expect(applyNoteEdit(removed, "en paz", "otra cosa").deletedAt).toBe(
      "2026-03-02T09:00:00.000Z",
    );
  });

  it("does not set updatedAt itself", () => {
    // The store stamps it, so this stays a pure function of its input and
    // two corrections with the same text are indistinguishable here.
    expect(applyNoteEdit(NOTE, "en paz", "otra cosa").updatedAt).toBe(NOTE.updatedAt);
  });

  it("does not modify the note it is given", () => {
    applyNoteEdit(NOTE, "en paz", "otra cosa");

    expect(NOTE.mood).toBe("cansado");
    expect(NOTE.content).toBe("Hoy me costo concentrarme");
  });

  it("accepts an emptied mood", () => {
    // Clearing the mood is a correction like any other.
    expect(applyNoteEdit(NOTE, "", NOTE.content).mood).toBe("");
  });
});
