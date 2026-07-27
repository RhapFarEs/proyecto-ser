"use client";

import { useState } from "react";

import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import { Body, Caption } from "@/components/ui/Typography";

type DirectionStatementModuleProps = {
  statement?: string;
  onSave?: (statement: string) => void;
};

export default function DirectionStatementModule({
  statement = "",
  onSave,
}: DirectionStatementModuleProps) {
  const [draft, setDraft] = useState(statement);
  const [savedValue, setSavedValue] = useState(statement);

  const isSaved = draft.trim().length > 0 && draft.trim() === savedValue.trim();

  const handleSave = () => {
    const trimmed = draft.trim();
    onSave?.(trimmed);
    setSavedValue(trimmed);
  };

  return (
    <Section>
      <Card className="space-y-4 sm:space-y-5">
        <SectionTitle>Dirección personal</SectionTitle>

        <Body className="text-stone-100">¿Hacia qué tipo de vida quiero caminar?</Body>

        <TextArea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escribe con calma. Puedes dejarlo así por ahora."
          className="min-h-[140px]"
        />

        <div className="flex items-center gap-3">
          <Button type="button" variant="primary" onClick={handleSave}>
            Guardar
          </Button>

          {isSaved ? <Caption className="text-stone-500">Guardado.</Caption> : null}
        </div>
      </Card>
    </Section>
  );
}
