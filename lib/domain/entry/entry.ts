export interface BaseEntry {
  id: string;
  type: "journal" | "habit" | "ritual" | "intention" | "reflection";
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry extends BaseEntry {
  type: "journal";
  mood: string;
  content: string;
  closingReflection: string;
}

export interface HabitEntry extends BaseEntry {
  type: "habit";
  habitId: string;
  completed: boolean;
}

export interface RitualEntry extends BaseEntry {
  type: "ritual";
  ritualId: string;
  completed: boolean;
}

export interface IntentionEntry extends BaseEntry {
  type: "intention";
  content: string;
}

export interface ReflectionEntry extends BaseEntry {
  type: "reflection";
  content: string;
}

export type Entry =
  | JournalEntry
  | HabitEntry
  | RitualEntry
  | IntentionEntry
  | ReflectionEntry;

export function createJournalEntry(id: string, mood: string, content: string, closingReflection: string): JournalEntry {
  const now = new Date().toISOString();

  return {
    id,
    type: "journal",
    createdAt: now,
    updatedAt: now,
    mood,
    content,
    closingReflection,
  };
}

export function createHabitEntry(id: string, habitId: string, completed: boolean): HabitEntry {
  const now = new Date().toISOString();

  return {
    id,
    type: "habit",
    createdAt: now,
    updatedAt: now,
    habitId,
    completed,
  };
}

export function createRitualEntry(id: string, ritualId: string, completed: boolean): RitualEntry {
  const now = new Date().toISOString();

  return {
    id,
    type: "ritual",
    createdAt: now,
    updatedAt: now,
    ritualId,
    completed,
  };
}

export function createIntentionEntry(id: string, content: string): IntentionEntry {
  const now = new Date().toISOString();

  return {
    id,
    type: "intention",
    createdAt: now,
    updatedAt: now,
    content,
  };
}

export function createReflectionEntry(id: string, content: string): ReflectionEntry {
  const now = new Date().toISOString();

  return {
    id,
    type: "reflection",
    createdAt: now,
    updatedAt: now,
    content,
  };
}
