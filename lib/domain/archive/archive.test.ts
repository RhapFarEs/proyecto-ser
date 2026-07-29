import { describe, expect, it } from "vitest";

import { buildArchiveDocument, type Archive, type ArchiveEntry } from "./archive";

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
