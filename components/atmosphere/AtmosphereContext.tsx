"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  ATMOSPHERE_STORAGE_KEY,
  DEFAULT_ATMOSPHERE,
  isAtmosphereId,
  type AtmosphereId,
} from "@/lib/domain/atmosphere/atmosphere";

/**
 * Which light is on.
 *
 * localStorage is an external store, so it is read with
 * `useSyncExternalStore` rather than an effect: that is what the hook is
 * for, it keeps the server snapshot explicit (always the default, which is
 * what the server can honestly know), and it avoids the
 * set-state-during-effect pattern that produces an extra render on every
 * mount.
 *
 * The switching itself is one attribute on <html>. Every colour resolves
 * from CSS variables scoped to it, so changing atmosphere re-renders
 * nothing and no component needs to know atmospheres exist.
 */
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab changing it should change it here too — the same person,
  // the same eyes, the same room.
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): AtmosphereId {
  const stored = window.localStorage.getItem(ATMOSPHERE_STORAGE_KEY);
  return isAtmosphereId(stored) ? stored : DEFAULT_ATMOSPHERE;
}

function getServerSnapshot(): AtmosphereId {
  return DEFAULT_ATMOSPHERE;
}

export function useAtmosphere() {
  const atmosphere = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setAtmosphere = useCallback((next: AtmosphereId) => {
    window.localStorage.setItem(ATMOSPHERE_STORAGE_KEY, next);
    document.documentElement.dataset.atmosphere = next;

    // Mobile browser chrome sits directly against the page, so it has to
    // move with it — otherwise the status bar stays night-dark above a
    // paper-white screen. The same values are applied pre-paint by the
    // inline script in app/layout.tsx.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "papel" ? "#f5f2ec" : "#0c0a09");

    for (const listener of listeners) {
      listener();
    }
  }, []);

  return { atmosphere, setAtmosphere };
}
