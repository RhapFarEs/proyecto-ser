"use client";

import { useState } from "react";

import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import ModuleHeader from "@/components/ui/ModuleHeader";
import Divider from "@/components/ui/Divider";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import { Caption } from "@/components/ui/Typography";
import type { Week, WeeklyReflection } from "@/lib/domain/week/week";

type WeeklyReflectionModuleProps = {
  week: Week;
  onSave?: (reflection: WeeklyReflection) => void;
};

export default function WeeklyReflectionModule({ week, onSave }: WeeklyReflectionModuleProps) {
  const [wentWell, setWentWell] = useState(week.reflection.wentWell);
  const [difficult, setDifficult] = useState(week.reflection.difficult);
  const [nextWeekFocus, setNextWeekFocus] = useState(week.reflection.nextWeekFocus);
  const [savedReflection, setSavedReflection] = useState(week.reflection);

  const hasSavedContent =
    savedReflection.wentWell.trim().length > 0 ||
    savedReflection.difficult.trim().length > 0 ||
    savedReflection.nextWeekFocus.trim().length > 0;

  const isSaved =
    hasSavedContent &&
    wentWell.trim() === savedReflection.wentWell.trim() &&
    difficult.trim() === savedReflection.difficult.trim() &&
    nextWeekFocus.trim() === savedReflection.nextWeekFocus.trim();

  const handleSave = () => {
    const trimmed: WeeklyReflection = {
      wentWell: wentWell.trim(),
      difficult: difficult.trim(),
      nextWeekFocus: nextWeekFocus.trim(),
    };

    onSave?.(trimmed);
    setSavedReflection(trimmed);
  };

  return (
    <Section>
      <Card className="space-y-5">
        <SectionTitle>Reflexión semanal</SectionTitle>

        <div className="space-y-3">
          <ModuleHeader title="¿Qué estuvo bien esta semana?" />
          <TextArea
            value={wentWell}
            onChange={(event) => setWentWell(event.target.value)}
            placeholder="Escribe con calma."
            className="min-h-[96px]"
          />
        </div>

        <Divider />

        <div className="space-y-3">
          <ModuleHeader title="¿Qué fue difícil o quiero comprender mejor?" />
          <TextArea
            value={difficult}
            onChange={(event) => setDifficult(event.target.value)}
            placeholder="Sin prisa, sin juicio."
            className="min-h-[96px]"
          />
        </div>

        <Divider />

        <div className="space-y-3">
          <ModuleHeader title="¿Qué quiero cuidar la próxima semana?" />
          <TextArea
            value={nextWeekFocus}
            onChange={(event) => setNextWeekFocus(event.target.value)}
            placeholder="Una intención, no una lista de tareas."
            className="min-h-[96px]"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="button" variant="primary" onClick={handleSave}>
            Guardar
          </Button>

          {isSaved ? <Caption className="text-stone-500">Guardado.</Caption> : null}
        </div>
      </Card>
    </Section>
  );
}
