"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import ModuleHeader from "@/components/ui/ModuleHeader";
import type { LifeArea } from "@/lib/domain/life-area/life-area";

export type LifeAreaFormValues = {
  title: string;
  whyItMatters: string;
};

type LifeAreaFormModuleProps = {
  area?: LifeArea | null;
  onSubmit: (values: LifeAreaFormValues) => void;
  onCancel: () => void;
};

export default function LifeAreaFormModule({
  area,
  onSubmit,
  onCancel,
}: LifeAreaFormModuleProps) {
  const [title, setTitle] = useState(area?.title ?? "");
  const [whyItMatters, setWhyItMatters] = useState(area?.whyItMatters ?? "");

  const canSubmit = title.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit({ title: title.trim(), whyItMatters: whyItMatters.trim() });
  };

  return (
    <Card className="space-y-5">
      <ModuleHeader
        title={area ? "Editar área" : "Nueva área"}
        subtitle="Nombra algo que te importa cuidar."
      />

      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Nombre del área"
      />

      <TextArea
        value={whyItMatters}
        onChange={(event) => setWhyItMatters(event.target.value)}
        placeholder="¿Por qué te importa?"
        className="min-h-[96px]"
      />

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="primary"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Guardar
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </Card>
  );
}
