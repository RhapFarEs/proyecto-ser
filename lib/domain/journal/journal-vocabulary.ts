import { getJournalNotes } from "./journal-storage";

/**
 * The words this person actually reaches for, most-used first.
 *
 * A brand-new installation offers six moods the product chose. Nothing about
 * that is wrong — it just isn't anyone's. Over months a person keeps typing
 * the same handful of words into the mood field, and those words are better
 * than ours by definition: they are the vocabulary they already think in.
 *
 * So the row of suggestions slowly becomes theirs, with no setting, no
 * editor and no moment where they were asked. It is the same mechanism that
 * wears a fretboard where the hand falls.
 */

/** Below this a word is not yet a habit of speech, just something typed once. */
const MIN_USES = 2;

export function getOwnMoodVocabulary(): string[] {
  const counts = new Map<string, { label: string; uses: number }>();

  for (const note of getJournalNotes()) {
    const label = note.mood.trim();

    if (!label) {
      continue;
    }

    // Keyed case-insensitively so "En paz" and "en paz" are one word, while
    // the label keeps whatever capitalisation they last used themselves.
    const key = label.toLowerCase();
    const existing = counts.get(key);

    counts.set(key, { label, uses: (existing?.uses ?? 0) + 1 });
  }

  return Array.from(counts.values())
    .filter((entry) => entry.uses >= MIN_USES)
    .sort((left, right) => right.uses - left.uses || left.label.localeCompare(right.label))
    .map((entry) => entry.label);
}
