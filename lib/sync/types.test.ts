import { describe, expect, it } from "vitest";

import { applyRestore } from "./types";
import { createHabit } from "@/lib/domain/habit/habit";
import { createLifeArea } from "@/lib/domain/life-area/life-area";

describe("undoing a removal, whatever was removed", () => {
  it("brings a practice back with everything that made it that practice", () => {
    // The point of undo here: a habit kept for months carries days of
    // completions that point at its id. Restoring by id, rather than
    // recreating, is what makes those days reappear with it.
    const habit = createHabit("Caminar", "Salir de casa", [1, 3, 5]);
    const removed = { ...habit, deletedAt: "2026-03-02T09:00:00.000Z" };

    const restored = applyRestore(removed);

    expect(restored.deletedAt).toBeNull();
    expect(restored.id).toBe(habit.id);
    expect(restored.title).toBe("Caminar");
    expect(restored.purpose).toBe("Salir de casa");
    expect(restored.weekdays).toEqual([1, 3, 5]);
    expect(restored.createdAt).toBe(habit.createdAt);
  });

  it("keeps a practice archived if that is how it was removed", () => {
    // Undo returns things as they were, which is not the same as active.
    const habit = { ...createHabit("Leer", "", [1]), active: false };
    const removed = { ...habit, deletedAt: "2026-03-02T09:00:00.000Z" };

    expect(applyRestore(removed).active).toBe(false);
  });

  it("brings an area back still in focus", () => {
    const area = { ...createLifeArea("Salud", "Quiero durar"), inFocus: true };
    const removed = { ...area, deletedAt: "2026-03-02T09:00:00.000Z" };

    const restored = applyRestore(removed);

    expect(restored.deletedAt).toBeNull();
    expect(restored.inFocus).toBe(true);
    expect(restored.whyItMatters).toBe("Quiero durar");
  });

  it("is harmless on something that was never removed", () => {
    const habit = createHabit("Caminar", "", [1]);

    expect(applyRestore(habit)).toEqual(habit);
  });

  it("does not modify what it is given", () => {
    const removed = { ...createHabit("Caminar", "", [1]), deletedAt: "2026-03-02T09:00:00.000Z" };

    applyRestore(removed);

    expect(removed.deletedAt).toBe("2026-03-02T09:00:00.000Z");
  });
});
