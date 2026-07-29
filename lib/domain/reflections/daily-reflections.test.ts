import { describe, expect, it } from "vitest";

import { addDaysToKey } from "@/lib/date";
import { getDailyReflection, selectOwnReflectionLines } from "./daily-reflections";

/** 38 characters — comfortably inside the bounds for a line of one's own. */
const A_SENTENCE = "Lo que sostengo hoy me sostiene mañana";

const WRITTEN_ON = "2026-03-01";

function written(text: string, dateKey: string = WRITTEN_ON) {
  return [{ dateKey, text }];
}

describe("what may become a line of one's own", () => {
  it("takes a sentence written long enough ago", () => {
    const lines = selectOwnReflectionLines(written(A_SENTENCE), addDaysToKey(WRITTEN_ON, 14));

    expect(lines).toEqual([A_SENTENCE]);
  });

  it("waits the full two weeks", () => {
    const source = written(A_SENTENCE);

    expect(selectOwnReflectionLines(source, addDaysToKey(WRITTEN_ON, 13))).toEqual([]);
    expect(selectOwnReflectionLines(source, addDaysToKey(WRITTEN_ON, 14))).toEqual([A_SENTENCE]);
  });

  it("leaves out fragments too short to stand at display size", () => {
    // A task is not a line. "Entrenar" in the largest type on the screen
    // reads as a leftover, not as something worth reading again.
    const lines = selectOwnReflectionLines(written("Entrenar"), addDaysToKey(WRITTEN_ON, 30));

    expect(lines).toEqual([]);
  });

  it("leaves out anything too long to hold at that size", () => {
    const lines = selectOwnReflectionLines(written("a".repeat(191)), addDaysToKey(WRITTEN_ON, 30));

    expect(lines).toEqual([]);
  });

  it("trims what it keeps", () => {
    const lines = selectOwnReflectionLines(
      written(`   ${A_SENTENCE}\n`),
      addDaysToKey(WRITTEN_ON, 30),
    );

    expect(lines).toEqual([A_SENTENCE]);
  });

  it("returns the same lines whatever order storage gave them", () => {
    const first = { dateKey: WRITTEN_ON, text: A_SENTENCE };
    const second = { dateKey: WRITTEN_ON, text: "Puedo estar en paz y en proceso al mismo tiempo" };
    const todayKey = addDaysToKey(WRITTEN_ON, 30);

    expect(selectOwnReflectionLines([first, second], todayKey)).toEqual(
      selectOwnReflectionLines([second, first], todayKey),
    );
  });
});

describe("the line offered for today", () => {
  it("gives the same line for the same day", () => {
    expect(getDailyReflection("2026-03-01")).toEqual(getDailyReflection("2026-03-01"));
  });

  it("speaks entirely in the product's voice while the person has written nothing", () => {
    const reflection = getDailyReflection("2026-03-01");

    expect(reflection.isOwn).toBe(false);
    expect(reflection.text.length).toBeGreaterThan(0);
  });

  it("lets a person's own line surface once they have one, without taking over", () => {
    // The patina, in miniature: one line of theirs against forty-two of ours
    // shows up sometimes and stays rare. A young installation should still
    // sound like the product.
    let ownDays = 0;

    for (let offset = 0; offset < 365; offset += 1) {
      const reflection = getDailyReflection(addDaysToKey("2026-01-01", offset), [A_SENTENCE]);

      if (reflection.isOwn) {
        expect(reflection.text).toBe(A_SENTENCE);
        ownDays += 1;
      }
    }

    expect(ownDays).toBeGreaterThan(0);
    expect(ownDays).toBeLessThan(180);
  });

  it("marks a line as theirs only when it is theirs", () => {
    for (let offset = 0; offset < 60; offset += 1) {
      const reflection = getDailyReflection(addDaysToKey("2026-01-01", offset), [A_SENTENCE]);

      expect(reflection.isOwn).toBe(reflection.text === A_SENTENCE);
    }
  });
});
