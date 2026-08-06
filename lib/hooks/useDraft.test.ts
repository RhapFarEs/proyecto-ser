import { afterEach, describe, expect, it } from "vitest";

import storage from "@/lib/storage/storage";
import { clearDrafts, draftToRestore, DRAFT_KEYS, hasUnsavedDrafts } from "./useDraft";

function installStorage(): void {
  const entries = new Map<string, string>();

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => entries.get(key) ?? null,
        setItem: (key: string, value: string) => {
          entries.set(key, value);
        },
        removeItem: (key: string) => {
          entries.delete(key);
        },
        clear: () => entries.clear(),
      },
    },
  });
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("what the editor opens with", () => {
  it("restores what the person had typed and not saved", () => {
    const stored = { scope: "", text: "Estaba a media frase" };

    expect(draftToRestore(stored, "", "")).toBe("Estaba a media frase");
  });

  it("prefers the unsaved draft over what was saved earlier", () => {
    // The draft is the more recent thing they typed. Saving stays explicit,
    // so showing it can never replace what is already in the archive.
    const stored = { scope: "", text: "lo nuevo" };

    expect(draftToRestore(stored, "lo guardado", "")).toBe("lo nuevo");
  });

  it("falls back to the saved writing when there is no draft", () => {
    expect(draftToRestore(undefined, "lo guardado", "")).toBe("lo guardado");
  });

  it("ignores a draft belonging to something else", () => {
    // Moving to another week must not show the week before it half-written.
    const stored = { scope: "2026-03-02", text: "de otra semana" };

    expect(draftToRestore(stored, "lo guardado", "2026-03-09")).toBe("lo guardado");
  });

  it("restores a draft that belongs to what is on screen", () => {
    const stored = { scope: "2026-03-09", text: "de esta semana" };

    expect(draftToRestore(stored, "lo guardado", "2026-03-09")).toBe("de esta semana");
  });

  it("ignores anything that is not a draft", () => {
    expect(draftToRestore(null, "lo guardado", "")).toBe("lo guardado");
    expect(draftToRestore("texto suelto", "lo guardado", "")).toBe("lo guardado");
    expect(draftToRestore({ text: 42 }, "lo guardado", "")).toBe("lo guardado");
    expect(draftToRestore({ text: "sin scope" }, "lo guardado", "")).toBe("lo guardado");
  });

  it("restores an empty draft when that is genuinely what they left", () => {
    // Cleared on purpose is not the same as never written.
    expect(draftToRestore({ scope: "", text: "" }, "lo guardado", "")).toBe("");
  });
});

describe("leaving an account", () => {
  it("removes every draft", () => {
    installStorage();
    for (const key of Object.values(DRAFT_KEYS)) {
      storage.set(key, { scope: "", text: "algo privado" });
    }

    clearDrafts();

    for (const key of Object.values(DRAFT_KEYS)) {
      expect(storage.get(key)).toBeUndefined();
    }
  });

  it("does not fail when there is nothing to remove", () => {
    installStorage();

    expect(() => clearDrafts()).not.toThrow();
  });

  it("does not fail when there is no device", () => {
    expect(() => clearDrafts()).not.toThrow();
  });
});

describe("the keys themselves", () => {
  it("are fixed, so drafts cannot accumulate", () => {
    const keys = Object.values(DRAFT_KEYS);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.every((key) => key.startsWith("ser.draft."))).toBe(true);
  });
});

describe("knowing whether something is part-written", () => {
  it("says no when nothing has been typed", () => {
    installStorage();

    expect(hasUnsavedDrafts()).toBe(false);
  });

  it("says yes when a draft holds words", () => {
    installStorage();
    storage.set(DRAFT_KEYS.journalNote, { scope: "", text: "Hoy me costó" });

    expect(hasUnsavedDrafts()).toBe(true);
  });

  it("does not count a draft that is only whitespace", () => {
    // Otherwise leaving would be interrupted to protect a stray newline.
    installStorage();
    storage.set(DRAFT_KEYS.intention, { scope: "", text: "   \n " });

    expect(hasUnsavedDrafts()).toBe(false);
  });

  it("looks at every writing surface, not only the journal", () => {
    installStorage();
    storage.set(DRAFT_KEYS.weeklyDifficult, { scope: "2026-03-02", text: "Algo" });

    expect(hasUnsavedDrafts()).toBe(true);
  });

  it("says no again once the drafts are cleared", () => {
    installStorage();
    storage.set(DRAFT_KEYS.direction, { scope: "", text: "Hacia allá" });

    clearDrafts();

    expect(hasUnsavedDrafts()).toBe(false);
  });

  it("ignores a value that is not a draft at all", () => {
    installStorage();
    storage.set(DRAFT_KEYS.journalNote, "texto suelto de una versión anterior");

    expect(hasUnsavedDrafts()).toBe(false);
  });
});
