"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import ModuleHeader from "@/components/ui/ModuleHeader";
import type { Weekday } from "@/lib/domain/habit/habit";

export type HabitFormValues = {
  title: string;
  purpose: string;
  weekdays: Weekday[];
};

type HabitFormModuleProps = {
  /**
   * Pre-fills the form — from an existing habit when editing, from a
   * `HabitSuggestion` when starting from a suggestion, or omitted for a
   * blank form. The form itself doesn't need to know which of those it
   * is: every path ends up as the same editable draft.
   */
  initialValues?: HabitFormValues | null;
  isEditing?: boolean;
  onSubmit: (values: HabitFormValues) => void;
  onCancel: () => void;
};

const WEEKDAY_OPTIONS: { value: Weekday; label: string }[] = [
  { value: 1, label: "Lu" },
  { value: 2, label: "Ma" },
  { value: 3, label: "Mi" },
  { value: 4, label: "Ju" },
  { value: 5, label: "Vi" },
  { value: 6, label: "Sá" },
  { value: 0, label: "Do" },
];

export default function HabitFormModule({
  initialValues,
  isEditing = false,
  onSubmit,
  onCancel,
}: HabitFormModuleProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [purpose, setPurpose] = useState(initialValues?.purpose ?? "");
  const [weekdays, setWeekdays] = useState<Weekday[]>(initialValues?.weekdays ?? []);

  const canSubmit = title.trim().length > 0 && weekdays.length > 0;

  const toggleWeekday = (value: Weekday) => {
    setWeekdays((current) =>
      current.includes(value)
        ? current.filter((day) => day !== value)
        : [...current, value],
    );
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit({ title: title.trim(), purpose: purpose.trim(), weekdays });
  };

  return (
    <Card className="space-y-4">
      <ModuleHeader
        title={isEditing ? "Editar hábito" : "Nuevo hábito"}
        subtitle="Elige algo pequeño y sostenible."
      />

      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Nombre del hábito"
      />

      <TextArea
        value={purpose}
        onChange={(event) => setPurpose(event.target.value)}
        placeholder="¿Para qué quieres sostener este hábito? En una frase."
        className="!min-h-[64px]"
      />

      <div className="flex flex-wrap gap-2">
        {WEEKDAY_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={weekdays.includes(option.value) ? "primary" : "secondary"}
            onClick={() => toggleWeekday(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

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
