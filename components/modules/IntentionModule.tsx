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
            <Body className="text-xl font-light leading-8 text-zinc-100 sm:text-2xl sm:leading-9">
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
              className="min-h-[96px]"
            />

            <Button type="button" variant="primary" onClick={handleSave}>
              Guardar intención
            </Button>
          </>
        )}
      </Card>
    </Section>
  );
}
