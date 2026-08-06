"use client";

import { useMemo, useSyncExternalStore } from "react";

import { getDataVersion, subscribeToData } from "@/lib/sync/data-version";
import { useHydrated } from "./useHydrated";

/**
 * Reads something out of the stores, and re-reads it whenever anything
 * anyone has written changes.
 *
 * Screens used to read their data once, on mount, and then keep their own
 * copy in step by hand after every write. That worked for writes made on
 * the screen doing the writing and failed for everything else — most
 * visibly on a second device, where signing in filled the stores from
 * Supabase moments after the screen had already decided the person had
 * written nothing, and left them looking at an empty journal until they
 * thought to reload.
 *
 * `fallback` is what the server renders and what the first client render
 * matches, so hydration never mismatches.
 */
export function useStoredValue<T>(
  read: () => T,
  fallback: T,
  /**
   * Anything else the read depends on — a chosen week, a chosen date. Must
   * be the same length on every render of a given call site, as with any
   * dependency list.
   */
  keys: readonly unknown[] = [],
): T {
  const hydrated = useHydrated();

  /*
    A counter rather than the data itself: the getters are free to build a
    fresh value per call (`getAllDays` sorts, `getDay` invents a blank day),
    and `useSyncExternalStore` comparing those by identity would never
    settle.
  */
  const version = useSyncExternalStore(subscribeToData, getDataVersion, () => 0);

  // Serialised rather than spread so the dependency list stays a literal of
  // fixed length, whatever a call site passes.
  const keyToken = JSON.stringify(keys);

  /*
    `version` and `keyToken` are the dependencies that matter: between them
    they change exactly when `read()` would answer differently. `read` itself
    is deliberately excluded — call sites pass an inline closure, so
    including it would recompute on every render and make the memo pointless.
  */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => (hydrated ? read() : fallback), [hydrated, version, keyToken]);
}
