import { getAllDays } from "@/lib/domain/day/day-storage";
import { getJournalNotes } from "@/lib/domain/journal/journal-storage";
import type { EchoSource } from "./echo";

/**
 * Everything a person has written that is worth meeting again: the
 * intentions they set for a day, and the notes they wrote in their journal.
 *
 * Weekly reflections are deliberately excluded. They are written *about* a
 * period rather than from inside a moment, so they read as summary, and a
 * summary handed back later lands like a report rather than a memory.
 *
 * `selectEcho` stays pure and takes this as an argument, so the choosing —
 * the only part with judgment in it — can be reasoned about and exercised
 * without touching storage.
 */
export function gatherEchoSources(): EchoSource[] {
  const intentions: EchoSource[] = getAllDays()
    .filter((day) => day.intention.trim().length > 0)
    .map((day) => ({
      id: `intention:${day.id}`,
      dateKey: day.date,
      text: day.intention,
    }));

  const notes: EchoSource[] = getJournalNotes().map((note) => ({
    id: `note:${note.id}`,
    dateKey: note.dayKey,
    text: note.content,
  }));

  return [...intentions, ...notes];
}
