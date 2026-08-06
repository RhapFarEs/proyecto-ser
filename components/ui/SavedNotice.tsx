"use client";

import { useEffect, useRef } from "react";

import { Caption } from "@/components/ui/Typography";

/**
 * How long the confirmation stands.
 *
 * Shorter than the undo offer, because this reports something already done
 * rather than offering a choice. It says its one word and goes — left on
 * screen it stops meaning "just now" and starts meaning nothing, and by the
 * second visit nobody can tell whether it refers to this save or the last
 * one.
 */
const SAVED_NOTICE_MS = 2600;

type SavedNoticeProps = {
  /** Past tense, and short. */
  message?: string;
  /** Called when it withdraws on its own. */
  onDismiss: () => void;
};

/**
 * Confirmation that something was written down.
 *
 * Mount it when a save succeeds and give it a `key` that changes per save,
 * so saving twice restarts the moment rather than inheriting the remains of
 * the first one.
 *
 * Polite, never assertive: a confirmation should never interrupt what
 * someone is doing, and it is announced rather than only shown so that it
 * exists for people who are not looking at that corner of the screen.
 */
export default function SavedNotice({ message = "Guardado.", onDismiss }: SavedNoticeProps) {
  // Held in a ref so the countdown belongs to the save, not to how often the
  // surrounding screen happens to re-render.
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const timer = window.setTimeout(() => dismissRef.current(), SAVED_NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Caption className="ser-settle-in text-ink-faint" role="status" aria-live="polite">
      {message}
    </Caption>
  );
}
