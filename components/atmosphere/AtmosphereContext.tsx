"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  ATMOSPHERE_GROUND,
  ATMOSPHERE_STORAGE_KEY,
  DEFAULT_ATMOSPHERE,
  SYSTEM_DARK_ATMOSPHERE,
  SYSTEM_LIGHT_ATMOSPHERE,
  isAtmosphereId,
  type AtmosphereId,
} from "@/lib/domain/atmosphere/atmosphere";

const SYSTEM_LIGHT_QUERY = "(prefers-color-scheme: light)";

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

  // Someone who has not chosen a room is following their system, so the room
  // has to follow it too — including when it flips at sunset on its own.
  // Once a choice is stored this fires and changes nothing, which is correct.
  const systemLight = window.matchMedia(SYSTEM_LIGHT_QUERY);
  systemLight.addEventListener("change", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
    systemLight.removeEventListener("change", listener);
  };
}

function getSnapshot(): AtmosphereId {
  const stored = window.localStorage.getItem(ATMOSPHERE_STORAGE_KEY);
  if (isAtmosphereId(stored)) {
    return stored;
  }

  // Must resolve exactly as the pre-paint script in app/layout.tsx does, or
  // the chooser would mark Tinta as selected on a light-mode device that is
  // plainly showing Papel.
  return window.matchMedia(SYSTEM_LIGHT_QUERY).matches
    ? SYSTEM_LIGHT_ATMOSPHERE
    : SYSTEM_DARK_ATMOSPHERE;
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
    // paper-white screen. The same map is applied pre-paint by the inline
    // script in app/layout.tsx; both must list every atmosphere, or a new
    // one silently gets the wrong first frame.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", ATMOSPHERE_GROUND[next]);

    for (const listener of listeners) {
      listener();
    }
  }, []);

  return { atmosphere, setAtmosphere };
}
