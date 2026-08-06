"use client";

import { useEffect, useRef } from "react";

import Button from "@/components/ui/Button";
import { Caption } from "@/components/ui/Typography";

/**
 * How long the offer stands.
 *
 * Longer than the save confirmation: that one reports something already
 * done, this one is an offer, and it has to outlast the moment of "wait,
 * no". Then it withdraws quietly rather than sitting there as an accusation.
 */
const UNDO_WINDOW_MS = 9000;

type UndoNoticeProps = {
  /** What just happened, in the past tense. */
  message: string;
  onUndo: () => void;
  /** Called when the window closes without anyone taking the offer. */
  onDismiss: () => void;
};

/**
 * The offer to take back a removal.
 *
 * Mount it when something has been removed and give it a `key` of whatever
 * was removed, so a second removal restarts the window instead of inheriting
 * the remains of the first one's.
 */
export default function UndoNotice({ message, onUndo, onDismiss }: UndoNoticeProps) {
  // Held in a ref so the countdown is tied to the removal, not to how often
  // the screen around it happens to re-render. An inline callback changes
  // identity every render, and a timer keyed on that would never expire.
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const timer = window.setTimeout(() => dismissRef.current(), UNDO_WINDOW_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="ser-settle-in flex items-center gap-2" role="status" aria-live="polite">
      <Caption>{message}</Caption>

      <Button type="button" variant="ghost" onClick={onUndo}>
        Deshacer
      </Button>
    </div>
  );
}
