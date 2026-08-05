import type { ArchiveEntry } from "./archive";

/**
 * Finding something you half-remember writing.
 *
 * Plain text, no index, no ranking by anything other than when it was
 * written. Ranking results by how well they match would be the product
 * deciding which of someone's own sentences matters most, which it does not
 * do — so the only order here is the one the archive already has.
 *
 * Everything is compared without accents and without case, because a person
 * looking for what they wrote should not have to remember whether they typed
 * "costó" or "costo" at eleven at night.
 */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * Every term must appear, so adding a word narrows rather than widens — the
 * behaviour of every search anyone has used, and the only one where typing
 * more gets you closer.
 */
export function matchesQuery(text: string, query: string): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean);

  if (terms.length === 0) {
    return false;
  }

  const haystack = normalize(text);

  return terms.every((term) => haystack.includes(term));
}

/**
 * Newest first, because someone searching for something usually wants the
 * most recent time they said it — and because the alternative is ordering by
 * a relevance score, which this product has no business computing about a
 * person's own writing.
 */
export function searchArchive(
  entries: readonly ArchiveEntry[],
  query: string,
): ArchiveEntry[] {
  if (query.trim().length === 0) {
    return [];
  }

  return entries
    .filter((entry) => matchesQuery(entry.text, query))
    .sort((left, right) => {
      const byDate = right.dateKey.localeCompare(left.dateKey);

      return byDate !== 0 ? byDate : right.text.localeCompare(left.text);
    });
}
