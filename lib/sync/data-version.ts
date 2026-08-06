type Listener = () => void;

/**
 * A number that changes whenever any domain's data changes — a local write,
 * or a pull that brought someone's own writing back from another device.
 *
 * Screens read straight from the stores rather than keeping their own copy;
 * this is what tells them the answer would be different now. It is a
 * counter and not the data itself because the getters are free to build a
 * fresh value per call (`getAllDays` sorts, `getDay` invents a blank day),
 * and comparing those by identity would never settle.
 *
 * Kept apart from `createSyncedStore` so it can be tested without a
 * Supabase client having to exist.
 */
const listeners = new Set<Listener>();
let version = 0;

export function notifyDataChanged(): void {
  version += 1;

  for (const listener of listeners) {
    listener();
  }
}

export function getDataVersion(): number {
  return version;
}

export function subscribeToData(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
