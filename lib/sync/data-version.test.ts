import { describe, expect, it } from "vitest";

import { getDataVersion, notifyDataChanged, subscribeToData } from "./data-version";

describe("noticing that stored data changed", () => {
  it("changes the version on every change", () => {
    const before = getDataVersion();

    notifyDataChanged();

    expect(getDataVersion()).not.toBe(before);
  });

  it("tells everyone listening", () => {
    // Two screens can be mounted at once — the tab bar keeps them alive.
    let first = 0;
    let second = 0;
    const stopFirst = subscribeToData(() => (first += 1));
    const stopSecond = subscribeToData(() => (second += 1));

    notifyDataChanged();

    expect(first).toBe(1);
    expect(second).toBe(1);

    stopFirst();
    stopSecond();
  });

  it("stops telling a screen that has gone away", () => {
    let calls = 0;
    const stop = subscribeToData(() => (calls += 1));

    notifyDataChanged();
    stop();
    notifyDataChanged();

    expect(calls).toBe(1);
  });

  it("gives listeners a version that has already moved", () => {
    // A screen re-reads inside the notification; it must not be handed the
    // number from before the change, or it would memoise the stale answer.
    const seen: number[] = [];
    const stop = subscribeToData(() => seen.push(getDataVersion()));
    const before = getDataVersion();

    notifyDataChanged();
    stop();

    expect(seen).toHaveLength(1);
    expect(seen[0]).toBeGreaterThan(before);
  });

  it("survives a listener unsubscribing twice", () => {
    const stop = subscribeToData(() => {});

    stop();
    stop();

    expect(() => notifyDataChanged()).not.toThrow();
  });
});
