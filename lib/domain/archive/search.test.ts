import { describe, expect, it } from "vitest";

import type { ArchiveEntry } from "./archive";
import { matchesQuery, searchArchive } from "./search";

function entry(dateKey: string, text: string): ArchiveEntry {
  return { dateKey, kind: "note", text };
}

describe("matching", () => {
  it("finds a word inside a sentence", () => {
    expect(matchesQuery("Hoy me costó concentrarme", "costó")).toBe(true);
  });

  it("ignores accents in both directions", () => {
    // Nobody remembers at eleven at night whether they typed the accent.
    expect(matchesQuery("Hoy me costó concentrarme", "costo")).toBe(true);
    expect(matchesQuery("Hoy me costo concentrarme", "costó")).toBe(true);
    expect(matchesQuery("Mi corazón", "corazon")).toBe(true);
  });

  it("ignores case", () => {
    expect(matchesQuery("Llamar a mi Hermana", "hermana")).toBe(true);
  });

  it("narrows as terms are added", () => {
    const text = "Llamar a mi hermana el domingo";

    expect(matchesQuery(text, "llamar hermana")).toBe(true);
    expect(matchesQuery(text, "llamar padre")).toBe(false);
  });

  it("does not care what order the terms come in", () => {
    expect(matchesQuery("Llamar a mi hermana", "hermana llamar")).toBe(true);
  });

  it("matches partial words, so a half-remembered stem still finds it", () => {
    expect(matchesQuery("concentrarme", "concentr")).toBe(true);
  });

  it("finds nothing for an empty query", () => {
    expect(matchesQuery("cualquier cosa", "")).toBe(false);
    expect(matchesQuery("cualquier cosa", "   ")).toBe(false);
  });
});

describe("searching the archive", () => {
  const entries = [
    entry("2026-03-01", "Hoy me costó concentrarme"),
    entry("2026-05-01", "Otra vez me costó arrancar"),
    entry("2026-04-01", "Salí a caminar"),
  ];

  it("returns nothing until something is typed", () => {
    expect(searchArchive(entries, "")).toEqual([]);
    expect(searchArchive(entries, "  ")).toEqual([]);
  });

  it("returns every writing that matches", () => {
    expect(searchArchive(entries, "costo")).toHaveLength(2);
  });

  it("returns the most recent first", () => {
    expect(searchArchive(entries, "costo").map((match) => match.dateKey)).toEqual([
      "2026-05-01",
      "2026-03-01",
    ]);
  });

  it("returns nothing rather than guessing when there is no match", () => {
    expect(searchArchive(entries, "bicicleta")).toEqual([]);
  });

  it("searches every kind of writing, not only notes", () => {
    const mixed: ArchiveEntry[] = [
      { dateKey: "2026-03-01", kind: "intention", text: "Caminar despacio" },
      { dateKey: "2026-03-02", kind: "weekly", text: "Qué estuvo bien:\nCaminar más" },
      { dateKey: "2026-03-03", kind: "reflection", text: "Caminé al final" },
    ];

    expect(searchArchive(mixed, "camin")).toHaveLength(3);
  });

  it("gives the same answer every time", () => {
    expect(searchArchive(entries, "costo")).toEqual(searchArchive(entries, "costo"));
  });

  it("does not reorder the archive it was given", () => {
    const original = entries.map((item) => item.dateKey);

    searchArchive(entries, "costo");

    expect(entries.map((item) => item.dateKey)).toEqual(original);
  });
});
