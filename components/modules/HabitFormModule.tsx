"use client";

import { useId, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import ModuleHeader from "@/components/ui/ModuleHeader";
import { Caption } from "@/components/ui/Typography";
import type { Weekday } from "@/lib/domain/habit/habit";

export type HabitFormValues = {
  title: string;
  purpose: string;
  weekdays: Weekday[];
};

type HabitFormModuleProps = {
  /**
   * Pre-fills the form when editing an existing practice, omitted for a
   * blank one. The form does not need to know which: both end up as the
   * same editable draft.
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
  const weekdaysLabelId = useId();

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
        title={isEditing ? "Editar práctica" : "Nueva práctica"}
        subtitle="Elige algo pequeño y sostenible."
      />

      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Nombre de la práctica"
        aria-label="Nombre de la práctica"
      />

      <TextArea
        value={purpose}
        onChange={(event) => setPurpose(event.target.value)}
        placeholder="¿Para qué quieres sostener esta práctica? En una frase."
        aria-label="¿Para qué quieres sostener esta práctica?"
        className="!min-h-[64px]"
      />

      {/*
        A labelled group, and each day says whether it is on. Seven
        two-letter buttons whose only state was a background colour
        announced as seven ambiguous controls with nothing to distinguish
        them.
      */}
      <div className="space-y-2">
        <Caption id={weekdaysLabelId}>¿Qué días quieres sostenerla?</Caption>

        <div
          role="group"
          aria-labelledby={weekdaysLabelId}
          className="flex flex-wrap gap-2"
        >
          {WEEKDAY_OPTIONS.map((option) => {
            const selected = weekdays.includes(option.value);

            return (
              <Button
                key={option.value}
                type="button"
                variant={selected ? "primary" : "secondary"}
                aria-pressed={selected}
                onClick={() => toggleWeekday(option.value)}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-2">
        {/*
          Said rather than left to be inferred. Someone typed a name, pressed
          Guardar and nothing happened, because a day had to be chosen and
          nothing on the screen mentioned it — a dead end on the first
          creative act this screen asks for.
        */}
        {!canSubmit ? (
          <Caption>
            {title.trim().length === 0
              ? "Ponle un nombre y elige al menos un día."
              : "Elige al menos un día para sostenerla."}
          </Caption>
        ) : null}

        <div className="flex gap-2">
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
      </div>
    </Card>
  );
}
