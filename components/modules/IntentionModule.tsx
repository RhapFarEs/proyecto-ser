"use client";

import { useState } from "react";

import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import { Body } from "@/components/ui/Typography";

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
  const [draft, setDraft] = useState(intention);

  const handleSave = () => {
    const trimmed = draft.trim();

    if (!trimmed) {
      return;
    }

    onSaveIntention?.(trimmed);
    setMode("saved");
  };

  const handleEdit = () => {
    setDraft(intention);
    setMode("editing");
  };

  return (
    <Section>
      <Card className="space-y-3">
        <SectionTitle>Intención del día</SectionTitle>

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

            <Button type="button" variant="ghost" onClick={handleEdit}>
              Editar
            </Button>
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
