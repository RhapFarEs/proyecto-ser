"use client";

import Page from "@/components/ui/Page";
import todayModules from "@/components/modules/today.config";
import { getLocalDateKey, getWeekStartKey, getWeekdayOfKey } from "@/lib/date";
import { createDay } from "@/lib/domain/day/day";
import { getAllDays, getDay, updateDay } from "@/lib/domain/day/day-storage";
import { isHabitCompleted, setHabitCompletion } from "@/lib/domain/day/day-habits";
import { getTodayInsight } from "@/lib/domain/insights/insight-engine";
import { selectEcho } from "@/lib/domain/memory/echo";
import { gatherEchoSources } from "@/lib/domain/memory/echo-sources";
import { selectOwnReflectionLines } from "@/lib/domain/reflections/daily-reflections";
import { getLifeDirection } from "@/lib/domain/direction/direction-storage";
import { getToday } from "@/lib/today";
import { isHabitScheduledOn, type Habit, type Weekday } from "@/lib/domain/habit/habit";
import { getHabits } from "@/lib/domain/habit/habit-storage";
import { getJournalNotes } from "@/lib/domain/journal/journal-storage";
import { getWeek } from "@/lib/domain/week/week-storage";
import { getLifeArea } from "@/lib/domain/life-area/life-area-storage";
import { useStoredValue } from "@/lib/hooks/useStoredValue";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useAuth } from "@/lib/auth/AuthContext";

export default function TodayView() {
  const { profile } = useAuth();
  const todayDate = getLocalDateKey();
  const todayWeekday = getWeekdayOfKey(todayDate) as Weekday;
  const currentWeekId = getWeekStartKey();
  const hydrated = useHydrated();
  /*
    Everything on this screen, read from the stores together.

    Read on every change rather than once at mount: a practice created on
    the Habits screen used to be invisible here until the app was reloaded,
    because this screen had taken its copy of the list and stopped looking.
    Gathering it in one place also stops `gatherEchoSources()` and the full
    day history from being rebuilt on every render.
  */
  const {
    intention,
    insight,
    echo,
    today,
    personalMotto,
    weeklyFocusAreaTitle,
    dailyHabits,
  } = useStoredValue(
    () => {
      const currentDay = getDay(todayDate);
      const habits = getHabits();
      const week = getWeek(currentWeekId);

      // Everything the person has written feeds two different things from
      // the same source: the echo (a memory, dated and rare) and the pool
      // the day's line is drawn from (undated, unremarked, theirs).
      const written = gatherEchoSources();
      // Days that hold at least one note. The insight engine needs this
      // because notes no longer live inside the day record.
      const dayKeysWithNotes = new Set(getJournalNotes().map((note) => note.dayKey));

      return {
        intention: currentDay.intention,
        // History is only read so the insight engine can recognise a
        // return; it is never displayed here.
        insight: getTodayInsight(currentDay, habits, new Date(), getAllDays(), dayKeysWithNotes),
        echo: selectEcho(written, todayDate),
        today: getToday(selectOwnReflectionLines(written, todayDate)),
        // Their own direction takes the place of the product's motto at the
        // foot of the screen, once they've written one.
        personalMotto: getLifeDirection()?.statement ?? null,
        // Reused, not duplicated: the same Week record Weekly Review writes
        // `focusLifeAreaId` to (via WeeklyFocusAreaModule) is only read here.
        weeklyFocusAreaTitle: week.focusLifeAreaId
          ? getLifeArea(week.focusLifeAreaId)?.title ?? null
          : null,
        // Ritual and Habits are the same concept: the checklist below is
        // every active habit scheduled for today's weekday, not a separate
        // hardcoded ritual list. See lib/domain/habit/habit.ts.
        dailyHabits: habits
          .filter((habit) => habit.active && isHabitScheduledOn(habit, todayWeekday))
          .map((habit) => ({ habit, completed: isHabitCompleted(currentDay, habit.id) })),
      };
    },
    {
      intention: "",
      insight: getTodayInsight(createDay(todayDate), [], new Date(), []),
      echo: null,
      today: getToday([]),
      personalMotto: null,
      weeklyFocusAreaTitle: null,
      dailyHabits: [] as { habit: Habit; completed: boolean }[],
    },
  );

  const visibleModules = [...todayModules]
    .filter((module) => module.enabled)
    .sort((left, right) => left.order - right.order);

  const handleHabitToggle = (habitId: string) => {
    updateDay(todayDate, (current) =>
      setHabitCompletion(current, habitId, !isHabitCompleted(current, habitId)),
    );
  };

  const handleSaveIntention = (value: string) => {
    updateDay(todayDate, (current) => ({
      ...current,
      intention: value,
    }));
  };

  return (
    <Page title="" subtitle="">
      {visibleModules.map((module) => {
        const ModuleComponent = module.component;
        const props = {
          today,
          dailyHabits,
          onHabitToggle: handleHabitToggle,
          intention,
          onSaveIntention: handleSaveIntention,
          insight,
          echo,
          weeklyFocusAreaTitle,
          displayName: profile?.displayName,
          hydrated,
          personalMotto,
        };

        // Once real client data replaces the hydration-safe fallback, the
        // key changes and React remounts each module. This is what lets a
        // module like IntentionModule — which seeds its own internal
        // "editing vs saved" state from a prop at mount — pick that state
        // up correctly from real data instead of freezing on the empty
        // fallback it first saw during the (necessarily fallback-only)
        // hydration render.
        return (
          <ModuleComponent key={`${module.id}:${hydrated}`} {...props} />
        );
      })}
    </Page>
  );
}
