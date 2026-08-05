"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import { Caption } from "@/components/ui/Typography";

type ConfirmButtonProps = {
  /** What the button says before anything is asked. */
  label: string;
  /** The question, phrased so the answer is obvious. */
  question: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

/**
 * Two steps rather than a dialog.
 *
 * Removing something is worth a deliberate second press, but a modal would
 * be louder than anything else in this product — it takes the screen away
 * and demands an answer. This asks in place, quietly, and going back is one
 * press and costs nothing.
 *
 * The pending state lives here so that every caller does not have to keep an
 * id in state to remember which row is mid-question.
 */
export default function ConfirmButton({
  label,
  question,
  confirmLabel = "Eliminar",
  onConfirm,
}: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button type="button" variant="ghost" onClick={() => setConfirming(true)}>
        {label}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Caption>{question}</Caption>

      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          onConfirm();
          setConfirming(false);
        }}
      >
        {confirmLabel}
      </Button>

      <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
        Cancelar
      </Button>
    </div>
  );
}
