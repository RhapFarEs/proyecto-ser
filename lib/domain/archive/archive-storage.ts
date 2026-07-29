import { getLocalDateKey } from "@/lib/date";
import { getAllDays } from "@/lib/domain/day/day-storage";
import { getJournalNotes } from "@/lib/domain/journal/journal-storage";
import { getWeeks } from "@/lib/domain/week/week-storage";
import { getHabits } from "@/lib/domain/habit/habit-storage";
import { getLifeAreas } from "@/lib/domain/life-area/life-area-storage";
import { getDirectionHistory, getLifeDirection } from "@/lib/domain/direction/direction-storage";
import { collectArchiveEntries, type Archive, type ArchiveNamed } from "./archive";

/** Life areas and practices are only worth listing once they have a name. */
function named(items: { title: string; note: string }[]): ArchiveNamed[] {
  return items.filter((item) => item.title.trim().length > 0);
}

/**
 * Reads every local store and hands the result to the pure collector.
 *
 * A shell, deliberately: it owns what time it is, who the person is, and what
 * is on disk, and it makes no decisions. Everything with reasoning in it —
 * which fields hold words, how a week's three answers become one passage —
 * lives in `collectArchiveEntries`, where it can be tested without a browser.
 *
 * Local reads only. An export has to work offline, because a record you can
 * only retrieve with a network is not one you fully hold.
 */
export function gatherArchive(
  person: { displayName: string; startedAt: string | null } | null,
  exportedAt: string,
): Archive {
  const current = getLifeDirection();
  const direction = current ? [current, ...getDirectionHistory()] : [];

  return {
    displayName: person?.displayName ?? "",
    startedAt: person?.startedAt ? getLocalDateKey(new Date(person.startedAt)) : null,
    exportedAt,
    entries: collectArchiveEntries(getAllDays(), getJournalNotes(), getWeeks()),
    direction: direction.map((revision) => ({
      statement: revision.statement,
      dateKey: getLocalDateKey(new Date(revision.createdAt)),
      atmosphere: revision.atmosphere,
    })),
    lifeAreas: named(
      getLifeAreas().map((area) => ({ title: area.title, note: area.whyItMatters })),
    ),
    practices: named(getHabits().map((habit) => ({ title: habit.title, note: habit.purpose }))),
  };
}
