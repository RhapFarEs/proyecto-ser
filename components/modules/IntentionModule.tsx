"use client";

import { useState } from "react";

import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import ConfirmButton from "@/components/ui/ConfirmButton";
import UndoNotice from "@/components/ui/UndoNotice";
import { Body } from "@/components/ui/Typography";
import { DRAFT_KEYS, useDraft } from "@/lib/hooks/useDraft";

type IntentionModuleProps = {
  intention?: string;
  onSaveIntention?: (value: string) => void;
};

export default function IntentionModule({
  intention = "",
  onSaveIntention,
}: IntentionModuleProps) {
  const [mode, setMode] = useState<"editing" | "saved">(
    intention.trim() ? "saved" : "editing",
  );
  const [draft, setDraft, discardDraft] = useDraft(DRAFT_KEYS.intention, intention);
  const [justCleared, setJustCleared] = useState<string | null>(null);

  const handleSave = () => {
    const trimmed = draft.trim();

    if (!trimmed) {
      return;
    }

    onSaveIntention?.(trimmed);
    discardDraft();
    setMode("saved");
  };

  const handleEdit = () => {
    setDraft(intention);
    setMode("editing");
  };

  /*
    An intention could be replaced but never taken back: saving refuses an
    empty value, so whatever was written first stayed on Today and on Camino
    for good. The Fourth Law says a person may always remove their own
    words, and one written in the wrong frame of mind is exactly the case it
    exists for.

    Same two-step confirm and nine-second undo as every other removal.
  */
  const handleClear = () => {
    const previous = intention;

    onSaveIntention?.("");
    discardDraft();
    setDraft("");
    setMode("editing");
    setJustCleared(previous);
  };

  const handleUndoClear = () => {
    if (!justCleared) {
      return;
    }

    onSaveIntention?.(justCleared);
    setMode("saved");
    setJustCleared(null);
  };

  return (
    <Section>
      <Card className="space-y-3">
        <SectionTitle>Intención del día</SectionTitle>

        {justCleared ? (
          <UndoNotice
            message="Intención eliminada."
            onUndo={handleUndoClear}
            onDismiss={() => setJustCleared(null)}
          />
        ) : null}

        {mode === "saved" ? (
          <>
            {/*
              `ser-display-weight`, not `font-light`. A hardcoded 300 is the
              exact bug the weight model exists to prevent: light-on-dark
              reads optically heavier, so the 300 that is elegant in Tinta
              goes anaemic as dark-on-light, and Papel and Piedra carry 400
              to *appear* the same. This is the largest text on the home
              screen, so it was the most visible place to get it wrong.
            */}
            {/*
              Serif, because they wrote it. The same sentence already reads
              back in serif on Camino and in the echo, so rendering it in the
              interface voice here made the home screen the one place a
              person's own words were spoken by the software instead of by
              them.
            */}
            <Body className="ser-voice ser-display-weight text-xl leading-8 text-ink sm:text-2xl sm:leading-9">
              {intention}
            </Body>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="ghost" onClick={handleEdit}>
                Editar
              </Button>

              <ConfirmButton
                label="Eliminar"
                question="¿Eliminar la intención de hoy?"
                onConfirm={handleClear}
              />
            </div>
          </>
        ) : (
          <>
            <TextArea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escribe tu intención para hoy"
              aria-label="Intención del día"
              className="min-h-[96px]"
            />

            {/*
              Disabled while empty rather than silently doing nothing on
              click — the same rule the Journal's save button already
              follows (LANGUAGE_GUIDE: a save button stays quietly disabled
              when there is nothing to save).
            */}
            <Button
              type="button"
              variant="primary"
              disabled={!draft.trim()}
              onClick={handleSave}
            >
              Guardar intención
            </Button>
          </>
        )}
      </Card>
    </Section>
  );
}
