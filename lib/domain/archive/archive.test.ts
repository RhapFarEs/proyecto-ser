import { describe, expect, it } from "vitest";

import type { Day } from "@/lib/domain/day/day";
import type { IntentionEntry, JournalEntry } from "@/lib/domain/entry/entry";
import type { JournalNote } from "@/lib/domain/journal/journal";
import type { Week } from "@/lib/domain/week/week";
import {
  buildArchiveDocument,
  collectArchiveEntries,
  type Archive,
  type ArchiveEntry,
} from "./archive";

const TIMESTAMPS = { deletedAt: null, createdAt: "2026-03-01", updatedAt: "2026-03-01" };

function day(overrides: Partial<Day> & { date: string }): Day {
  return {
    id: overrides.date,
    entries: [],
    journal: { mood: "", entry: "", closing: "" },
    rituals: { checks: [] },
    intention: "",
    ...TIMESTAMPS,
    ...overrides,
  };
}

function note(overrides: Partial<JournalNote> & { dayKey: string }): JournalNote {
  return { id: "n1", mood: "", content: "", ...TIMESTAMPS, ...overrides };
}

function week(overrides: Partial<Week> & { id: string }): Week {
  return {
    reflection: { wentWell: "", difficult: "", nextWeekFocus: "" },
    ...TIMESTAMPS,
    ...overrides,
  };
}

/**
 * Words live in more places than the current screens suggest, and P1.1 is
 * about to start removing some of them. Every one of these branches is a
 * place the safety net could have a hole.
 */
describe("gathering every word a person wrote", () => {
  it("takes the day's intention", () => {
    const entries = collectArchiveEntries([day({ date: "2026-03-01", intention: "Caminar" })], [], []);

    expect(entries).toEqual([{ dateKey: "2026-03-01", kind: "intention", text: "Caminar" }]);
  });

  it("takes the oldest flat journal a day used to carry", () => {
    const entries = collectArchiveEntries(
      [day({ date: "2026-03-01", journal: { mood: "cansado", entry: "Fue largo", closing: "Salió bien" } })],
      [],
      [],
    );

    expect(entries).toEqual([
      { dateKey: "2026-03-01", kind: "note", text: "Fue largo", mood: "cansado" },
      { dateKey: "2026-03-01", kind: "reflection", text: "Salió bien" },
    ]);
  });

  it("takes journal entries written before notes moved to their own store", () => {
    const entries = collectArchiveEntries(
      [
        day({
          date: "2026-03-01",
          entries: [
            {
              id: "e1",
              type: "journal",
              mood: "tranquilo",
              content: "Lo que escribí entonces",
              closingReflection: "",
              createdAt: "2026-03-01",
              updatedAt: "2026-03-01",
            },
          ],
        }),
      ],
      [],
      [],
    );

    expect(entries).toEqual([
      { dateKey: "2026-03-01", kind: "note", text: "Lo que escribí entonces", mood: "tranquilo" },
    ]);
  });

  it("takes the day's closing reflection, which is not legacy", () => {
    const entries = collectArchiveEntries(
      [
        day({
          date: "2026-03-01",
          entries: [
            {
              id: "e1",
              type: "reflection",
              content: "Cómo terminó el día",
              createdAt: "2026-03-01",
              updatedAt: "2026-03-01",
            },
          ],
        }),
      ],
      [],
      [],
    );

    expect(entries).toEqual([
      { dateKey: "2026-03-01", kind: "reflection", text: "Cómo terminó el día" },
    ]);
  });

  it("takes intentions from before day.intention existed", () => {
    const entries = collectArchiveEntries(
      [
        day({
          date: "2026-03-01",
          entries: [
            {
              id: "e1",
              type: "intention",
              content: "Una intención antigua",
              createdAt: "2026-03-01",
              updatedAt: "2026-03-01",
            },
          ],
        }),
      ],
      [],
      [],
    );

    expect(entries).toEqual([
      { dateKey: "2026-03-01", kind: "intention", text: "Una intención antigua" },
    ]);
  });

  it("ignores completions, which are not words", () => {
    const entries = collectArchiveEntries(
      [
        day({
          date: "2026-03-01",
          entries: [
            {
              id: "e1",
              type: "habit",
              habitId: "h1",
              completed: true,
              createdAt: "2026-03-01",
              updatedAt: "2026-03-01",
            },
          ],
        }),
      ],
      [],
      [],
    );

    expect(entries).toEqual([]);
  });

  it("takes journal notes with the mood chosen, and without", () => {
    const entries = collectArchiveEntries(
      [],
      [
        note({ id: "a", dayKey: "2026-03-01", content: "Con ánimo", mood: "cansado" }),
        note({ id: "b", dayKey: "2026-03-02", content: "Sin ánimo" }),
      ],
      [],
    );

    expect(entries).toEqual([
      { dateKey: "2026-03-01", kind: "note", text: "Con ánimo", mood: "cansado" },
      { dateKey: "2026-03-02", kind: "note", text: "Sin ánimo" },
    ]);
  });

  it("keeps a week's three answers together with the questions asked", () => {
    const entries = collectArchiveEntries(
      [],
      [],
      [
        week({
          id: "2026-03-02",
          reflection: { wentWell: "Dormí", difficult: "El trabajo", nextWeekFocus: "Caminar" },
        }),
      ],
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].kind).toBe("weekly");
    expect(entries[0].text).toBe(
      "Qué estuvo bien:\nDormí\n\nQué fue difícil:\nEl trabajo\n\nHacia la siguiente semana:\nCaminar",
    );
  });

  it("keeps a partly answered week", () => {
    const entries = collectArchiveEntries(
      [],
      [],
      [week({ id: "2026-03-02", reflection: { wentWell: "Dormí", difficult: "", nextWeekFocus: "" } })],
    );

    expect(entries[0].text).toBe("Qué estuvo bien:\nDormí");
  });

  it("skips a week nobody answered", () => {
    expect(collectArchiveEntries([], [], [week({ id: "2026-03-02" })])).toEqual([]);
  });

  it("skips blank and whitespace-only writing everywhere", () => {
    const entries = collectArchiveEntries(
      [day({ date: "2026-03-01", intention: "   \n " })],
      [note({ dayKey: "2026-03-01", content: "" })],
      [],
    );

    expect(entries).toEqual([]);
  });

  it("does not mutate what it is given", () => {
    const days = [day({ date: "2026-03-01", intention: "Caminar" })];

    collectArchiveEntries(days, [], []);

    expect(days[0].intention).toBe("Caminar");
  });
});

/**
 * `migrateDay` copied the flat legacy fields into `day.entries` and kept the
 * originals, so both sides describe one thing the person wrote once. The
 * policy collapses a pair only where one was provably copied from the other,
 * and only while the copy still says the same thing.
 */
function promotedJournal(
  dateKey: string,
  content: string,
  mood = "",
  closingReflection = "",
): JournalEntry {
  return {
    id: `${dateKey}:journal`,
    type: "journal",
    mood,
    content,
    closingReflection,
    createdAt: dateKey,
    updatedAt: dateKey,
  };
}

function promotedIntention(dateKey: string, content: string): IntentionEntry {
  return { id: `${dateKey}:intention`, type: "intention", content, createdAt: dateKey, updatedAt: dateKey };
}

describe("one writing is exported once", () => {
  it("collapses a promoted note and the field it was copied from", () => {
    const entries = collectArchiveEntries(
      [
        day({
          date: "2026-03-01",
          journal: { mood: "cansado", entry: "Fue un día largo", closing: "" },
          entries: [promotedJournal("2026-03-01", "Fue un día largo", "cansado")],
        }),
      ],
      [],
      [],
    );

    expect(entries).toEqual([
      { dateKey: "2026-03-01", kind: "note", text: "Fue un día largo", mood: "cansado" },
    ]);
  });

  it("collapses a promoted intention and the field it was copied from", () => {
    const entries = collectArchiveEntries(
      [
        day({
          date: "2026-03-01",
          intention: "Caminar despacio",
          entries: [promotedIntention("2026-03-01", "Caminar despacio")],
        }),
      ],
      [],
      [],
    );

    expect(entries).toEqual([
      { dateKey: "2026-03-01", kind: "intention", text: "Caminar despacio" },
    ]);
  });

  it("ignores surrounding whitespace when deciding they are the same", () => {
    const entries = collectArchiveEntries(
      [
        day({
          date: "2026-03-01",
          journal: { mood: "", entry: "  Fue un día largo\n", closing: "" },
          entries: [promotedJournal("2026-03-01", "Fue un día largo")],
        }),
      ],
      [],
      [],
    );

    expect(entries).toHaveLength(1);
  });

  it("exports a closing reflection that only the promoted copy still holds", () => {
    // The hole this correction closes. `closingReflection` was read by
    // nothing, so a day whose flat `closing` had been emptied lost that text
    // from the export entirely — a gap in the one feature whose job is not
    // losing anything.
    const entries = collectArchiveEntries(
      [
        day({
          date: "2026-03-01",
          journal: { mood: "", entry: "", closing: "" },
          entries: [promotedJournal("2026-03-01", "El día", "", "Cómo terminó")],
        }),
      ],
      [],
      [],
    );

    expect(entries).toContainEqual({
      dateKey: "2026-03-01",
      kind: "reflection",
      text: "Cómo terminó",
    });
  });

  it("collapses a closing reflection held identically on both sides", () => {
    const entries = collectArchiveEntries(
      [
        day({
          date: "2026-03-01",
          journal: { mood: "", entry: "", closing: "Cómo terminó" },
          entries: [promotedJournal("2026-03-01", "", "", "Cómo terminó")],
        }),
      ],
      [],
      [],
    );

    expect(entries).toEqual([
      { dateKey: "2026-03-01", kind: "reflection", text: "Cómo terminó" },
    ]);
  });
});

describe("two writings are never merged", () => {
  it("keeps both when the copy and its source have diverged", () => {
    // Ambiguous by construction: the flat field could still be written after
    // promotion, and neither side carries a timestamp of its own. Choosing a
    // winner would invent an order we do not have.
    const entries = collectArchiveEntries(
      [
        day({
          date: "2026-03-01",
          journal: { mood: "", entry: "Lo que quedó en el campo antiguo", closing: "" },
          entries: [promotedJournal("2026-03-01", "Lo que se copió entonces")],
        }),
      ],
      [],
      [],
    );

    expect(entries.map((entry) => entry.text)).toEqual([
      "Lo que se copió entonces",
      "Lo que quedó en el campo antiguo",
    ]);
  });

  it("keeps a live closing reflection separate from the legacy one", () => {
    // A stored reflection entry is never a promotion, so
    // matching text is a coincidence rather than a copy.
    const entries = collectArchiveEntries(
      [
        day({
          date: "2026-03-01",
          journal: { mood: "", entry: "", closing: "Cómo terminó" },
          entries: [
            {
              id: "2026-03-01:reflection",
              type: "reflection",
              content: "Cómo terminó",
              createdAt: "2026-03-01",
              updatedAt: "2026-03-01",
            },
          ],
        }),
      ],
      [],
      [],
    );

    expect(entries).toHaveLength(2);
  });

  it("keeps two notes that happen to say the same thing on the same day", () => {
    const entries = collectArchiveEntries(
      [],
      [
        note({ id: "a", dayKey: "2026-03-01", content: "Hoy me costó" }),
        note({ id: "b", dayKey: "2026-03-01", content: "Hoy me costó" }),
      ],
      [],
    );

    expect(entries).toHaveLength(2);
  });

  it("keeps a journal record that carries no promotion id", () => {
    // No known source to have been copied from, so it stands on its own.
    const entries = collectArchiveEntries(
      [
        day({
          date: "2026-03-01",
          journal: { mood: "", entry: "El campo plano", closing: "" },
          entries: [{ ...promotedJournal("2026-03-01", "El campo plano"), id: "un-uuid" }],
        }),
      ],
      [],
      [],
    );

    expect(entries).toHaveLength(2);
  });

  it("still exports the flat fields when nothing was ever promoted", () => {
    const entries = collectArchiveEntries(
      [day({ date: "2026-03-01", journal: { mood: "", entry: "El campo plano", closing: "El cierre" } })],
      [],
      [],
    );

    expect(entries).toEqual([
      { dateKey: "2026-03-01", kind: "note", text: "El campo plano" },
      { dateKey: "2026-03-01", kind: "reflection", text: "El cierre" },
    ]);
  });

  it("gives the same answer however many times it is asked", () => {
    const days = [
      day({
        date: "2026-03-01",
        intention: "Caminar",
        journal: { mood: "cansado", entry: "El día", closing: "El cierre" },
        entries: [
          promotedIntention("2026-03-01", "Caminar"),
          promotedJournal("2026-03-01", "El día", "cansado", "El cierre"),
        ],
      }),
    ];

    expect(collectArchiveEntries(days, [], [])).toEqual(collectArchiveEntries(days, [], []));
    expect(collectArchiveEntries(days, [], [])).toHaveLength(3);
  });
});

const EMPTY: Archive = {
  displayName: "",
  startedAt: null,
  exportedAt: "2026-07-29",
  entries: [],
  direction: [],
  lifeAreas: [],
  practices: [],
};

function archive(overrides: Partial<Archive>): Archive {
  return { ...EMPTY, ...overrides };
}

function entry(overrides: Partial<ArchiveEntry> & { dateKey: string }): ArchiveEntry {
  return { kind: "note", text: "algo", ...overrides };
}

describe("what the document contains", () => {
  it("names the archive for the person whose it is", () => {
    expect(buildArchiveDocument(archive({ displayName: "Jacob" }))).toContain(
      "# El archivo de Jacob",
    );
  });

  it("still produces a document for someone with no name set", () => {
    expect(buildArchiveDocument(EMPTY)).toContain("# Tu archivo");
  });

  it("says plainly that the document does not need us", () => {
    // The Fourth Law is the reason this feature exists; the file should say
    // so to the person holding it, not only to the people who built it.
    expect(buildArchiveDocument(EMPTY)).toContain("No necesitas Proyecto SER para leerlo");
  });

  it("is honest about an archive with nothing in it yet", () => {
    const document = buildArchiveDocument(EMPTY);

    expect(document).toContain("Todavía no hay nada aquí.");
    expect(document).not.toContain("## Tu dirección");
    expect(document).not.toContain("## Áreas de vida");
  });

  it("ends with exactly one newline", () => {
    const document = buildArchiveDocument(archive({ entries: [entry({ dateKey: "2026-03-01" })] }));

    expect(document.endsWith("\n")).toBe(true);
    expect(document.endsWith("\n\n")).toBe(false);
  });
});

describe("every word a person wrote", () => {
  it("carries each kind of writing through with its own label", () => {
    const document = buildArchiveDocument(
      archive({
        entries: [
          entry({ dateKey: "2026-03-01", kind: "intention", text: "Caminar despacio" }),
          entry({ dateKey: "2026-03-01", kind: "note", text: "Hoy me costó concentrarme" }),
          entry({ dateKey: "2026-03-01", kind: "reflection", text: "Salió mejor de lo que pensaba" }),
          entry({ dateKey: "2026-03-02", kind: "weekly", text: "Lo que fue bien:\nDormí" }),
        ],
      }),
    );

    expect(document).toContain("Caminar despacio");
    expect(document).toContain("Hoy me costó concentrarme");
    expect(document).toContain("Salió mejor de lo que pensaba");
    expect(document).toContain("Dormí");
    expect(document).toContain("**Intención**");
    expect(document).toContain("**Nota**");
    expect(document).toContain("**Cierre del día**");
    expect(document).toContain("**Revisión de la semana**");
  });

  it("keeps the mood a person chose beside the note", () => {
    const document = buildArchiveDocument(
      archive({ entries: [entry({ dateKey: "2026-03-01", mood: "cansado" })] }),
    );

    expect(document).toContain("**Nota** · cansado");
  });

  it("keeps a note without a mood clean", () => {
    expect(buildArchiveDocument(archive({ entries: [entry({ dateKey: "2026-03-01" })] }))).toContain(
      "**Nota**\n",
    );
  });

  it("keeps a multi-line entry together as one passage", () => {
    const document = buildArchiveDocument(
      archive({ entries: [entry({ dateKey: "2026-03-01", text: "Primera línea\nSegunda línea" })] }),
    );

    expect(document).toContain("> Primera línea\n> Segunda línea");
  });

  it("does not judge or omit a mundane entry", () => {
    // SER never decides whether something was worth writing down. An export
    // that quietly dropped errands would be a verdict on the record.
    const document = buildArchiveDocument(
      archive({ entries: [entry({ dateKey: "2026-03-01", text: "Comprar pan" })] }),
    );

    expect(document).toContain("Comprar pan");
  });
});

describe("the shape of a life", () => {
  it("reads forward, oldest first", () => {
    const document = buildArchiveDocument(
      archive({
        entries: [
          entry({ dateKey: "2026-05-01", text: "Lo más reciente" }),
          entry({ dateKey: "2026-03-01", text: "Lo más antiguo" }),
        ],
      }),
    );

    expect(document.indexOf("Lo más antiguo")).toBeLessThan(document.indexOf("Lo más reciente"));
  });

  it("orders a single day the way the day happened", () => {
    const document = buildArchiveDocument(
      archive({
        entries: [
          entry({ dateKey: "2026-03-01", kind: "reflection", text: "Al final del día" }),
          entry({ dateKey: "2026-03-01", kind: "intention", text: "Al empezar" }),
        ],
      }),
    );

    expect(document.indexOf("Al empezar")).toBeLessThan(document.indexOf("Al final del día"));
  });

  it("groups a day under one heading", () => {
    const document = buildArchiveDocument(
      archive({
        entries: [
          entry({ dateKey: "2026-03-01", kind: "intention", text: "Una" }),
          entry({ dateKey: "2026-03-01", kind: "note", text: "Otra" }),
        ],
      }),
    );

    expect(document.match(/^### /gm)).toHaveLength(1);
  });

  it("does not reorder the entries it is given", () => {
    const entries = [entry({ dateKey: "2026-05-01" }), entry({ dateKey: "2026-03-01" })];

    buildArchiveDocument(archive({ entries }));

    expect(entries.map((item) => item.dateKey)).toEqual(["2026-05-01", "2026-03-01"]);
  });

  it("is the same document for the same archive", () => {
    const input = archive({ entries: [entry({ dateKey: "2026-03-01" })] });

    expect(buildArchiveDocument(input)).toBe(buildArchiveDocument(input));
  });
});

describe("direction, areas and practices", () => {
  it("shows the current statement and everything before it", () => {
    const document = buildArchiveDocument(
      archive({
        direction: [
          { statement: "Caminar sin prisa", dateKey: "2026-05-01", atmosphere: "alba" },
          { statement: "Caminar despacio", dateKey: "2026-03-01", atmosphere: null },
        ],
      }),
    );

    expect(document).toContain("## Tu dirección");
    expect(document).toContain("Caminar sin prisa");
    expect(document).toContain("### Lo que escribiste antes");
    expect(document).toContain("Caminar despacio");
    expect(document.indexOf("Caminar sin prisa")).toBeLessThan(document.indexOf("Caminar despacio"));
  });

  it("omits the earlier section when there is only one statement", () => {
    const document = buildArchiveDocument(
      archive({ direction: [{ statement: "Caminar despacio", dateKey: "2026-03-01", atmosphere: null }] }),
    );

    expect(document).toContain("Caminar despacio");
    expect(document).not.toContain("### Lo que escribiste antes");
  });

  it("includes life areas and practices with why they matter", () => {
    const document = buildArchiveDocument(
      archive({
        lifeAreas: [{ title: "Salud", note: "Quiero llegar entero a los sesenta" }],
        practices: [{ title: "Caminar", note: "Me ordena la cabeza" }],
      }),
    );

    expect(document).toContain("## Áreas de vida");
    expect(document).toContain("### Salud");
    expect(document).toContain("Quiero llegar entero a los sesenta");
    expect(document).toContain("## Prácticas");
    expect(document).toContain("### Caminar");
    expect(document).toContain("Me ordena la cabeza");
  });

  it("keeps a titled item with no note", () => {
    const document = buildArchiveDocument(archive({ practices: [{ title: "Caminar", note: "" }] }));

    expect(document).toContain("### Caminar");
  });
});
