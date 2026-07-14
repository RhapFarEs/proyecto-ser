import type { ComponentType } from "react";

import type { Today } from "@/lib/models/Today";
import GreetingModule from "./GreetingModule";
import ReflectionModule from "./ReflectionModule";
import DailyInsightsModule from "./DailyInsightsModule";
import TodayWeeklyFocusModule from "./TodayWeeklyFocusModule";
import IntentionModule from "./IntentionModule";
import DailyHabitsModule, { type DailyHabitItem } from "./DailyHabitsModule";
import FooterModule from "./FooterModule";
import type { Insight } from "@/lib/domain/insights/insight";

export interface TodayModuleProps {
  today: Today;
  dailyHabits?: DailyHabitItem[];
  onHabitToggle?: (habitId: string) => void;
  intention?: string;
  onSaveIntention?: (value: string) => void;
  insight?: Insight | null;
  weeklyFocusAreaTitle?: string | null;
  displayName?: string | null;
}

export interface TodayModule {
  id: string;
  title: string;
  order: number;
  enabled: boolean;
  component: ComponentType<TodayModuleProps>;
}

// Order follows the page's intended arc: reflection (quote, insight, weekly
// focus) -> intention -> action (ritual). See TodayView's module docs for
// why this list, not each component's own file, is the place that decides
// the sequence.
const todayModules: TodayModule[] = [
  {
    id: "greeting",
    title: "Greeting",
    order: 0,
    enabled: true,
    component: GreetingModule,
  },
  {
    id: "reflection",
    title: "Today's quote",
    order: 1,
    enabled: true,
    component: ReflectionModule,
  },
  {
    id: "daily-insights",
    title: "Today's insight",
    order: 2,
    enabled: true,
    component: DailyInsightsModule,
  },
  {
    id: "weekly-focus",
    title: "Weekly focus area",
    order: 3,
    enabled: true,
    component: TodayWeeklyFocusModule,
  },
  {
    id: "intention",
    title: "Intention",
    order: 4,
    enabled: true,
    component: IntentionModule,
  },
  {
    id: "daily-habits",
    title: "Ritual del día",
    order: 5,
    enabled: true,
    component: DailyHabitsModule,
  },
  {
    id: "footer",
    title: "Footer",
    order: 6,
    enabled: true,
    component: FooterModule,
  },
];

export default todayModules;
