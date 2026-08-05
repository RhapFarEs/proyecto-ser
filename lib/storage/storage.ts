export interface StorageAdapter {
  get<T>(key: string, fallback?: T): T | undefined;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

/**
 * Whether the last attempt to write to this device succeeded.
 *
 * This exists because the failure was previously swallowed in silence. A
 * person writing in Safari's private browsing, or on a device whose storage
 * is full, would press Guardar, read "Guardado." and lose the writing on the
 * next reload — the product confirming a save it had not made. Nothing in
 * the interface could have told them, because nothing knew.
 *
 * Tracked here rather than reported to each caller so that no call site has
 * to remember to check: storage is the only part of the app that can know
 * whether the device is accepting writes, so it is the part that keeps the
 * answer.
 */
let writable = true;
const listeners = new Set<() => void>();

function setWritable(next: boolean): void {
  if (writable === next) {
    return;
  }

  writable = next;

  for (const listener of listeners) {
    listener();
  }
}

/** False once a write has failed, and true again as soon as one succeeds. */
export function isStorageWritable(): boolean {
  return writable;
}

export function subscribeToStorageHealth(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Asked per call rather than once at module load, so that a test can arrange
 * a device before the module has already decided there isn't one.
 *
 * Only the presence of a browser is checked here. Reaching `localStorage`
 * itself is left to each method's `try`, because some browsers throw on
 * *accessing* it rather than on writing to it — and a device that refuses to
 * be reached is refusing to save, which is not the same as there being no
 * device.
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeParse<T>(value: string): T | undefined {
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

const storage: StorageAdapter = {
  get<T>(key: string, fallback?: T): T | undefined {
    if (!isBrowser()) {
      return fallback;
    }

    try {
      const storedValue = window.localStorage.getItem(key);

      if (storedValue === null) {
        return fallback;
      }

      return safeParse<T>(storedValue) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    // Having no device to write to is not a device refusing to write: this
    // is the server rendering, where reporting a storage problem would put a
    // warning in front of someone whose device is fine.
    if (!isBrowser()) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setWritable(true);
    } catch {
      setWritable(false);
    }
  },
  remove(key: string): void {
    if (!isBrowser()) {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch {
      // A failed removal leaves stale data behind, which is recoverable and
      // costs the person nothing. Only failed writes lose something.
    }
  },
  clear(): void {
    if (!isBrowser()) {
      return;
    }

    try {
      window.localStorage.clear();
    } catch {
      // As above.
    }
  },
};

export default storage;
