"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useHydrated } from "./useHydrated";

/**
 * State that starts as `fallback` — identical on server and client, so
 * hydration never mismatches — and is replaced by `loader()`'s result
 * exactly once, on the first render after the component mounts on the
 * client. After that it behaves like ordinary `useState`: the returned
 * setter can keep updating it (e.g. after writing to storage) for the
 * rest of the component's life.
 *
 * The sync happens by adjusting state directly during render (comparing
 * against a `wasHydrated` flag), not inside a `useEffect` — this is the
 * pattern React's own docs recommend for "reset/derive state when a
 * condition changes" (see "Storing information from previous renders" at
 * react.dev), and it avoids both an extra effect-driven render pass and
 * the "don't call setState inside an effect" lint rule. `loader` still
 * only ever runs once `useHydrated()` is true, i.e. never during the
 * render that produces the initial (server-matching) markup.
 */
export function useClientState<T>(
  loader: () => T,
  fallback: T,
): [T, Dispatch<SetStateAction<T>>] {
  const hydrated = useHydrated();
  const [wasHydrated, setWasHydrated] = useState(false);
  const [value, setValue] = useState<T>(fallback);

  if (hydrated && !wasHydrated) {
    setWasHydrated(true);
    setValue(loader());
  }

  return [value, setValue];
}
