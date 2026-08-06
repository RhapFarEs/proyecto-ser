import { describe, expect, it } from "vitest";

import { getLocalDateKey, millisecondsUntilNextDay } from "./date";

describe("waiting for the day to turn over", () => {
  it("waits just past midnight, never exactly on it", () => {
    // A wake-up on the boundary can still read the previous date from a
    // clock that has not quite ticked over. A second late is invisible;
    // a day early is a note filed under the wrong day.
    const justBeforeMidnight = new Date(2026, 2, 10, 23, 59, 59, 0);

    expect(millisecondsUntilNextDay(justBeforeMidnight)).toBe(2000);
  });

  it("is a full day and a second at the very start of a day", () => {
    const midnight = new Date(2026, 2, 10, 0, 0, 0, 0);

    expect(millisecondsUntilNextDay(midnight)).toBe(86_400_000 + 1000);
  });

  it("is always positive, so a caller that reschedules itself cannot spin", () => {
    const moments = [
      new Date(2026, 2, 10, 0, 0, 0, 1),
      new Date(2026, 2, 10, 12, 0, 0, 0),
      new Date(2026, 2, 10, 23, 59, 59, 999),
    ];

    for (const moment of moments) {
      expect(millisecondsUntilNextDay(moment)).toBeGreaterThan(0);
    }
  });

  it("lands on the next calendar day, across a month boundary", () => {
    const lastNightOfMarch = new Date(2026, 2, 31, 23, 30, 0, 0);
    const landed = new Date(
      lastNightOfMarch.getTime() + millisecondsUntilNextDay(lastNightOfMarch),
    );

    expect(getLocalDateKey(landed)).toBe("2026-04-01");
  });

  it("lands on the next calendar day, across a year boundary", () => {
    const newYearsEve = new Date(2026, 11, 31, 23, 59, 0, 0);
    const landed = new Date(newYearsEve.getTime() + millisecondsUntilNextDay(newYearsEve));

    expect(getLocalDateKey(landed)).toBe("2027-01-01");
  });

  it("lands on the next calendar day, across a leap day", () => {
    const leapDay = new Date(2028, 1, 29, 22, 0, 0, 0);
    const landed = new Date(leapDay.getTime() + millisecondsUntilNextDay(leapDay));

    expect(getLocalDateKey(landed)).toBe("2028-03-01");
  });
});
