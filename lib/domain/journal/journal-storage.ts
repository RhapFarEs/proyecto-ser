import { createSyncedStore } from "@/lib/sync/createSyncedStore";
import { createJournalNote, type JournalNote } from "./journal";
import { importLegacyDayJournalNotes, migrateJournalNote } from "./journal-migrations";

export const JOURNAL_STORAGE_KEY = "ser.journal_entries";

interface JournalNoteRow {
  id: string;
  user_id: string;
  day_key: string;
  mood: string;
  content: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: JournalNoteRow): JournalNote {
  return {
    id: row.id,
    dayKey: row.day_key,
    mood: row.mood,
    content: row.content,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(note: JournalNote, userId: string): JournalNoteRow {
  return {
    id: note.id,
    user_id: userId,
    day_key: note.dayKey,
    mood: note.mood,
    content: note.content,
    deleted_at: note.deletedAt,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  };
}

/**
 * Journal follows the exact same `createSyncedStore` wiring as Habit — see
 * `lib/domain/habit/habit-storage.ts` for the reference. The only
 * Journal-specific piece is `migrateJournalToCloud`'s extra first step:
 * pulling notes out of the old per-Day `entries` array before doing the
 * usual upload, since Journal didn't have its own flat local store before
 * this milestone.
 */
const store = createSyncedStore<JournalNote, JournalNoteRow>({
  storageKey: JOURNAL_STORAGE_KEY,
  table: "journal_entries",
  normalize: migrateJournalNote,
  fromRow,
  toRow,
});

export function getJournalNotes(): JournalNote[] {
  return store.getAll();
}

export function getJournalNotesForDayKey(dayKey: string): JournalNote[] {
  return store.getAll().filter((note) => note.dayKey === dayKey);
}

export function saveJournalNote(dayKey: string, mood: string, content: string): JournalNote {
  const note = createJournalNote(dayKey, mood, content);
  store.save(note);
  return note;
}

export function updateJournalNote(
  id: string,
  updater: (note: JournalNote) => JournalNote,
): JournalNote | undefined {
  return store.update(id, updater);
}

export function removeJournalNote(id: string): void {
  store.remove(id);
}

export function subscribeToJournalNotes(listener: () => void): () => void {
  return store.subscribe(listener);
}

export function setJournalSyncUserId(userId: string | null): void {
  store.setUserId(userId);
}

export function pullJournalNotes(): Promise<void> {
  return store.pull();
}

export async function migrateJournalToCloud(): Promise<void> {
  for (const note of importLegacyDayJournalNotes()) {
    store.save(note);
  }

  await store.runInitialMigration();
}
