export interface JournalNote {
  id: string;
  dayKey: string;
  mood: string;
  content: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function createJournalNote(dayKey: string, mood: string, content: string): JournalNote {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    dayKey,
    mood,
    content,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}
