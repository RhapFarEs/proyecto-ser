import { createSyncedStore } from "@/lib/sync/createSyncedStore";
import { applyRestore } from "@/lib/sync/types";
import { applyNoteEdit, createJournalNote, type JournalNote } from "./journal";
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

/**
 * Corrects a note that is already written.
 *
 * The note keeps its own id and the moment it was written; only the words
 * and the mood change, and `updatedAt` moves. A correction is not a new
 * note — it happened when it happened, and it stays where it sits in its
 * day rather than jumping to the end because a typo was fixed.
 *
 * Identified by note id alone, which is what makes it work on a note from
 * any day. It used to take the `Day` as well and hand back a copy of it,
 * and that unused parameter is the whole reason correcting a note looked
 * like something only today could do.
 */
export function editJournalNote(id: string, mood: string, content: string): void {
  updateJournalNote(id, (note) => applyNoteEdit(note, mood, content));
}

/** Undoes a removal by clearing the tombstone. Also id-only. */
export function restoreJournalNote(id: string): void {
  updateJournalNote(id, applyRestore);
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
