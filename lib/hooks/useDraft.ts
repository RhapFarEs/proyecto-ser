"use client";

import { useCallback } from "react";

import storage from "@/lib/storage/storage";
import { useClientState } from "./useClientState";

/**
 * Text a person has typed and not yet saved, kept on this device so an
 * interruption does not cost them the sentence they were in the middle of.
 *
 * A draft is a convenience and never part of the archive. It is not synced,
 * never leaves the device, and is removed the moment the writing is saved
 * for real — so nothing here can ever become the thing someone keeps.
 *
 * Every key is fixed and listed below, so drafts cannot accumulate: there is
 * at most one per writing surface, no matter how long someone uses SER.
 */
export const DRAFT_KEYS = {
  journalNote: "ser.draft.journal-note",
  intention: "ser.draft.intention",
  direction: "ser.draft.direction",
  weeklyWentWell: "ser.draft.weekly.went-well",
  weeklyDifficult: "ser.draft.weekly.difficult",
  weeklyNextWeekFocus: "ser.draft.weekly.next-week-focus",
} as const;

const ALL_DRAFT_KEYS = Object.values(DRAFT_KEYS);

interface StoredDraft {
  /** What the draft belongs to, when a surface can show more than one thing. */
  scope: string;
  text: string;
}

function isStoredDraft(value: unknown): value is StoredDraft {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as StoredDraft).text === "string" &&
    typeof (value as StoredDraft).scope === "string"
  );
}

/**
 * Which text the editor should open with.
 *
 * The stored draft wins when there is one, because it is the more recent
 * thing the person typed — but only within its own scope. The weekly review
 * can be moved between weeks, and showing one week's unsaved text while
 * another week is on screen would be worse than showing nothing.
 *
 * This never returns anything that could replace saved writing: it chooses
 * what to *show in the editor*, and saving stays an explicit act.
 */
export function draftToRestore(stored: unknown, saved: string, scope: string): string {
  if (!isStoredDraft(stored) || stored.scope !== scope) {
    return saved;
  }

  return stored.text;
}

/**
 * Whether anything is part-written and not yet saved.
 *
 * Leaving an account throws every draft away, which is right — unsaved
 * words must not appear in front of whoever signs in next. But it is also
 * the one thing this product does that destroys writing, and it was
 * happening on a single tap with nothing said. This is what lets it ask
 * first, and only when there is actually something to lose.
 */
export function hasUnsavedDrafts(): boolean {
  return ALL_DRAFT_KEYS.some((key) => {
    const stored = storage.get<unknown>(key, undefined);

    return isStoredDraft(stored) && stored.text.trim().length > 0;
  });
}

/**
 * Removes every draft. Called when an account is left, so that unsaved words
 * cannot appear in front of whoever signs in next on a shared device.
 */
export function clearDrafts(): void {
  for (const key of ALL_DRAFT_KEYS) {
    storage.remove(key);
  }
}

/**
 * Returns the current text, a setter that also persists it, and a way to
 * throw the draft away once the writing has been saved properly.
 *
 * Storage failures are deliberately not handled here. `storage` already
 * reports a device that has stopped saving, and a draft is the one thing in
 * the product whose loss is survivable — warning about it twice would make
 * the smaller problem look like the larger one.
 */
export function useDraft(
  key: string,
  saved: string,
  scope = "",
): [string, (next: string) => void, () => void] {
  const [value, setValue] = useClientState<string>(
    () => draftToRestore(storage.get(key), saved, scope),
    saved,
  );

  const change = useCallback(
    (next: string) => {
      setValue(next);

      // An empty field is not a draft worth keeping, and removing it here is
      // what makes a saved note clean up after itself without a second call.
      if (next.trim().length > 0) {
        storage.set(key, { scope, text: next } satisfies StoredDraft);
      } else {
        storage.remove(key);
      }
    },
    [key, scope, setValue],
  );

  const discard = useCallback(() => storage.remove(key), [key]);

  return [value, change, discard];
}
