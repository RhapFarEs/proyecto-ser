"use client";

import { useSyncExternalStore } from "react";

// There's no real external store to subscribe to — this only exists to
// satisfy useSyncExternalStore's API. The value this hook exposes changes
// exactly once (server/hydration snapshot -> client snapshot), never again,
// so there's nothing for a subscriber to be notified about.
function subscribe(): () => void {
  return () => {};
}

function getClientSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * True once the component has mounted on the client; false during server
 * rendering and during the client's first (hydration) render.
 *
 * Built on `useSyncExternalStore` rather than a `useEffect` + `setState`
 * pair. `useSyncExternalStore` is the React-documented way to read a value
 * that must legitimately differ between the server-rendered snapshot and
 * the real client snapshot: React guarantees the hydration render uses
 * `getServerSnapshot()`, and only switches to `getClientSnapshot()` on the
 * render that follows — with no manual effect, and without tripping the
 * "don't setState inside an effect" lint rule.
 *
 * This is the single source of truth for "is it safe to read browser-only
 * data now" anywhere in the app. The server never has access to
 * `localStorage`, so any render that reads it produces markup the server
 * couldn't have produced — a hydration mismatch. Gating a read behind this
 * flag guarantees the first render is identical on server and client.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
