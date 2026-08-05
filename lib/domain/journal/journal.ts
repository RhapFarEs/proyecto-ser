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

/**
 * Corrects a note that is already written.
 *
 * Identity and the moment it was written are deliberately untouched: fixing
 * a typo does not make it a different note, and it should not move to the
 * end of the day because the words changed. Only the words, the mood and
 * `updatedAt` move — and `updatedAt` is set by the store, not here, so this
 * stays a pure function of what it is given.
 */
export function applyNoteEdit(note: JournalNote, mood: string, content: string): JournalNote {
  return { ...note, mood, content };
}

/**
 * Brings back a note that was just removed.
 *
 * Removal writes a tombstone rather than dropping the record, so the words
 * are still there and undoing is only a matter of clearing the mark. Nothing
 * else is touched: the note returns to the moment it was written rather than
 * to the end of the day.
 */
export function applyNoteRestore(note: JournalNote): JournalNote {
  return { ...note, deletedAt: null };
}
