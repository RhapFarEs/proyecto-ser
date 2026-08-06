"use client";

import { useSyncExternalStore } from "react";

import { getLocalDateKey, millisecondsUntilNextDay } from "@/lib/date";

/**
 * Today's date key, kept true while the app stays open.
 *
 * Screens used to read the date once per render and never recompute it,
 * which is fine for a page that reloads and wrong for an installed app that
 * is resumed rather than reopened. Two things went wrong because of it.
 *
 * A phone left on the Today screen overnight showed the previous day on
 * waking: yesterday's greeting, yesterday's line, yesterday's intention, and
 * yesterday's practices still ticked.
 *
 * Worse, handlers closed over that stale key. A note written at 00:05 with
 * the app already open was filed under the previous day — silently, and in
 * the one product where the date something was written is the whole point.
 *
 * Three things move the value: a timer at the next local midnight, which is
 * the only one that fires while someone is looking at the screen; a return
 * to visibility, which is how a resumed app catches up; and a window focus,
 * for a desktop tab that was simply left behind.
 */
function subscribe(onChange: () => void): () => void {
  let timer = 0;

  const scheduleNextDay = () => {
    timer = window.setTimeout(() => {
      onChange();
      scheduleNextDay();
    }, millisecondsUntilNextDay());
  };

  scheduleNextDay();
  document.addEventListener("visibilitychange", onChange);
  window.addEventListener("focus", onChange);

  return () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", onChange);
    window.removeEventListener("focus", onChange);
  };
}

/*
  The same function on both sides. The value is never rendered — it is only
  ever used to look something up, and every lookup is already gated on
  hydration — so a server clock in a different timezone cannot produce a
  markup mismatch. React simply re-renders once with the client's answer.
*/
function getSnapshot(): string {
  return getLocalDateKey();
}

export function useTodayKey(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
