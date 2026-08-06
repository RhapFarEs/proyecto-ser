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
import { createWeek, type WeeklyReflection } from "@/lib/domain/week/week";
import { getHabits } from "@/lib/domain/habit/habit-storage";
import { getJournalNotes } from "@/lib/domain/journal/journal-storage";
import { getLifeAreas } from "@/lib/domain/life-area/life-area-storage";
import type { Habit } from "@/lib/domain/habit/habit";
import type { LifeArea } from "@/lib/domain/life-area/life-area";
import type { Day } from "@/lib/domain/day/day";
import { useStoredValue } from "@/lib/hooks/useStoredValue";
import { useHydrated } from "@/lib/hooks/useHydrated";

// Extension point for a future Journey domain: this view already walks
// week-by-week and resolves a Life Area reference (focusLifeAreaId) without
// copying data — a Journey timeline could read the same weeks/areas rather
// than needing its own storage. No Journey concept exists yet.
export default function WeeklyReviewView() {
  const currentWeekStart = getWeekStartKey(new Date());
  const [weekStart, setWeekStart] = useState(currentWeekStart);
  const hydrated = useHydrated();
  const weekDayKeys = getWeekDayKeys(weekStart);

  /*
    Read from the stores on every change, and again whenever another week is
    chosen. Previously the week was loaded once and re-read by hand on each
    arrow press, while habits, areas and all seven days were rebuilt on every
    single render.
  */
  const { week, habits, areas, days, dayKeysWithNotes } = useStoredValue(
    () => ({
      week: getWeek(weekStart),
      habits: getHabits(),
      areas: getLifeAreas(),
      days: weekDayKeys.map((key) => getDay(key)),
      dayKeysWithNotes: new Set(getJournalNotes().map((note) => note.dayKey)) as ReadonlySet<string>,
    }),
    {
      week: createWeek(weekStart),
      habits: [] as Habit[],
      areas: [] as LifeArea[],
      days: [] as Day[],
      dayKeysWithNotes: new Set() as ReadonlySet<string>,
    },
    [weekStart],
  );

  const isCurrentWeek = weekStart === currentWeekStart;
  const weekRangeLabel = `${formatDateKeyLabel(weekStart)} – ${formatDateKeyLabel(weekDayKeys[6])}`;

  const goToPreviousWeek = () => {
    setWeekStart(addDaysToKey(weekStart, -7));
  };

  const goToNextWeek = () => {
    if (isCurrentWeek) {
      return;
    }

    setWeekStart(addDaysToKey(weekStart, 7));
  };

  const handleSaveReflection = (reflection: WeeklyReflection) => {
    updateWeek(weekStart, (current) => ({ ...current, reflection }));
  };

  const handleSelectFocusArea = (lifeAreaId: string | undefined) => {
    updateWeek(weekStart, (current) => ({
      ...current,
      focusLifeAreaId: lifeAreaId,
    }));
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

      <WeeklyContextModule days={days} habits={habits} dayKeysWithNotes={dayKeysWithNotes} />

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
        <Caption className="underline-offset-4 hover:text-ink-soft hover:underline">
          Dirección personal
        </Caption>
      </Link>
    </Page>
  );
}
