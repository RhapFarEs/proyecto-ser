import type { Entry } from "@/lib/domain/entry/entry";

export interface DayJournal {
  mood: string;
  entry: string;
  closing: string;
}

export interface DayRituals {
  checks: boolean[];
}

export interface Day {
  id: string;
  date: string;
  entries: Entry[];
  // Legacy compatibility fields retained for the current implementation.
  journal: DayJournal;
  rituals: DayRituals;
  intention: string;
}

export function createDay(date: string): Day {
  return {
    id: date,
    date,
    entries: [],
    // Legacy compatibility fields retained for the current implementation.
    journal: {
      mood: "calm",
      entry: "",
      closing: "",
    },
    rituals: {
      checks: [],
    },
    intention: "",
  };
}
