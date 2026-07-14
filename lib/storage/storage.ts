const isBrowser = typeof window !== "undefined";

export interface StorageAdapter {
  get<T>(key: string, fallback?: T): T | undefined;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
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
    if (!isBrowser) {
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
    if (!isBrowser) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage write failures.
    }
  },
  remove(key: string): void {
    if (!isBrowser) {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage removal failures.
    }
  },
  clear(): void {
    if (!isBrowser) {
      return;
    }

    try {
      window.localStorage.clear();
    } catch {
      // Ignore storage clear failures.
    }
  },
};

export default storage;
