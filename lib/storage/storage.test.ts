import { afterEach, describe, expect, it, vi } from "vitest";

import storage, { isStorageWritable, subscribeToStorageHealth } from "./storage";

type FakeStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

/**
 * A device that accepts writes, one that refuses them, and one that throws
 * the moment its storage is touched at all — which is what some browsers do
 * in private browsing, rather than failing on the write itself.
 */
function installStorage(store: FakeStorage | "throws-on-access" | null): void {
  if (store === null) {
    Reflect.deleteProperty(globalThis, "window");
    return;
  }

  if (store === "throws-on-access") {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        get localStorage(): never {
          throw new Error("access denied");
        },
      },
    });
    return;
  }

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: store },
  });
}

function workingStorage(): FakeStorage {
  const entries = new Map<string, string>();

  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, value);
    },
    removeItem: (key) => {
      entries.delete(key);
    },
    clear: () => entries.clear(),
  };
}

function fullStorage(): FakeStorage {
  return {
    ...workingStorage(),
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
  };
}

afterEach(() => {
  // Leave the module reporting health, so one test's broken device does not
  // become the next test's starting state.
  installStorage(workingStorage());
  storage.set("reset", true);
  installStorage(null);
});

describe("reading and writing", () => {
  it("round-trips a value", () => {
    installStorage(workingStorage());

    storage.set("clave", { texto: "hola" });

    expect(storage.get("clave")).toEqual({ texto: "hola" });
  });

  it("returns the fallback when nothing is stored", () => {
    installStorage(workingStorage());

    expect(storage.get("ausente", "por defecto")).toBe("por defecto");
  });

  it("returns the fallback rather than throwing on unreadable data", () => {
    const store = workingStorage();
    store.setItem("roto", "{no es json");
    installStorage(store);

    expect(storage.get("roto", "por defecto")).toBe("por defecto");
  });
});

describe("knowing whether this device is saving", () => {
  it("reports health after a successful write", () => {
    installStorage(workingStorage());

    storage.set("clave", "valor");

    expect(isStorageWritable()).toBe(true);
  });

  it("reports a failure when the device refuses the write", () => {
    // The case that lost people's writing in silence: the interface said
    // "Guardado." and nothing had been saved.
    installStorage(fullStorage());

    storage.set("clave", "valor");

    expect(isStorageWritable()).toBe(false);
  });

  it("reports a failure when storage cannot even be reached", () => {
    installStorage("throws-on-access");

    storage.set("clave", "valor");

    expect(isStorageWritable()).toBe(false);
  });

  it("recovers as soon as a write succeeds again", () => {
    installStorage(fullStorage());
    storage.set("clave", "valor");
    expect(isStorageWritable()).toBe(false);

    installStorage(workingStorage());
    storage.set("clave", "valor");

    expect(isStorageWritable()).toBe(true);
  });

  it("does not call a device unhealthy when there is no device", () => {
    // Rendering on the server is not a device refusing to save, and saying
    // so would put a warning in front of someone whose device is fine.
    installStorage(null);

    storage.set("clave", "valor");

    expect(isStorageWritable()).toBe(true);
  });
});

describe("telling the interface", () => {
  it("notifies subscribers when the device stops saving", () => {
    installStorage(workingStorage());
    storage.set("clave", "valor");

    const listener = vi.fn();
    const unsubscribe = subscribeToStorageHealth(listener);

    installStorage(fullStorage());
    storage.set("clave", "valor");

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("notifies again when it recovers", () => {
    installStorage(fullStorage());
    storage.set("clave", "valor");

    const listener = vi.fn();
    const unsubscribe = subscribeToStorageHealth(listener);

    installStorage(workingStorage());
    storage.set("clave", "valor");

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("stays quiet while nothing has changed", () => {
    installStorage(workingStorage());
    storage.set("clave", "valor");

    const listener = vi.fn();
    const unsubscribe = subscribeToStorageHealth(listener);

    storage.set("clave", "otro");
    storage.set("clave", "otro más");

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("stops notifying after unsubscribing", () => {
    installStorage(workingStorage());
    storage.set("clave", "valor");

    const listener = vi.fn();
    subscribeToStorageHealth(listener)();

    installStorage(fullStorage());
    storage.set("clave", "valor");

    expect(listener).not.toHaveBeenCalled();
  });
});
