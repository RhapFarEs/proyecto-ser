"use client";

import { useState } from "react";
import Link from "next/link";

import Page from "@/components/ui/Page";
import Button from "@/components/ui/Button";
import { Caption } from "@/components/ui/Typography";
import WeeklyContextModule from "@/components/modules/WeeklyContextModule";
import WeeklyFocusAreaModule from "@/components/modules/WeeklyFocusAreaModule";
import WeeklyReflectionModule from "@/components/modules/WeeklyReflectionModule";
import {
  addDaysToKey,
  formatDateKeyLabel,
  getWeekDayKeys,
  getWeekStartKey,
} from "@/lib/date";
import { getDay } from "@/lib/domain/day/day-storage";
import { getWeek, updateWeek } from "@/lib/domain/week/week-storage";
import { createWeek, type Week, type WeeklyReflection } from "@/lib/domain/week/week";
import { getHabits } from "@/lib/domain/habit/habit-storage";
import { getLifeAreas } from "@/lib/domain/life-area/life-area-storage";
import { useClientState } from "@/lib/hooks/useClientState";
import { useHydrated } from "@/lib/hooks/useHydrated";

// Extension point for a future Journey domain: this view already walks
// week-by-week and resolves a Life Area reference (focusLifeAreaId) without
// copying data — a Journey timeline could read the same weeks/areas rather
// than needing its own storage. No Journey concept exists yet.
export default function WeeklyReviewView() {
  const currentWeekStart = getWeekStartKey(new Date());
  const [weekStart, setWeekStart] = useState(currentWeekStart);
  const hydrated = useHydrated();
  const [week, setWeek] = useClientState<Week>(
    () => getWeek(currentWeekStart),
    createWeek(currentWeekStart),
  );

  const habits = hydrated ? getHabits() : [];
  const areas = hydrated ? getLifeAreas() : [];
  const weekDayKeys = getWeekDayKeys(weekStart);
  const days = hydrated ? weekDayKeys.map((key) => getDay(key)) : [];

  const isCurrentWeek = weekStart === currentWeekStart;
  const weekRangeLabel = `${formatDateKeyLabel(weekStart)} – ${formatDateKeyLabel(weekDayKeys[6])}`;

  const goToPreviousWeek = () => {
    const nextWeekStart = addDaysToKey(weekStart, -7);
    setWeekStart(nextWeekStart);
    setWeek(getWeek(nextWeekStart));
  };

  const goToNextWeek = () => {
    if (isCurrentWeek) {
      return;
    }

    const nextWeekStart = addDaysToKey(weekStart, 7);
    setWeekStart(nextWeekStart);
    setWeek(getWeek(nextWeekStart));
  };

  const handleSaveReflection = (reflection: WeeklyReflection) => {
    const next = updateWeek(weekStart, (current) => ({ ...current, reflection }));
    setWeek(next);
  };

  const handleSelectFocusArea = (lifeAreaId: string | undefined) => {
    const next = updateWeek(weekStart, (current) => ({
      ...current,
      focusLifeAreaId: lifeAreaId,
    }));
    setWeek(next);
  };

  return (
    <Page title="Revisión semanal" subtitle="Una mirada calmada a tu semana.">
      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={goToPreviousWeek}>
          Semana anterior
        </Button>

        <Caption className="text-center">{weekRangeLabel}</Caption>

        <Button type="button" variant="ghost" onClick={goToNextWeek} disabled={isCurrentWeek}>
          Semana siguiente
        </Button>
      </div>

      <WeeklyContextModule days={days} habits={habits} />

      <WeeklyFocusAreaModule
        areas={areas}
        focusLifeAreaId={week.focusLifeAreaId}
        onSelect={handleSelectFocusArea}
      />

      <WeeklyReflectionModule
        key={`${weekStart}:${hydrated}`}
        week={week}
        onSave={handleSaveReflection}
      />

      <Link href="/direction" className="inline-block w-fit">
        <Caption className="underline-offset-4 hover:text-zinc-300 hover:underline">
          Dirección personal
        </Caption>
      </Link>
    </Page>
  );
}
