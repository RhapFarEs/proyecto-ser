import type { ComponentType } from "react";

import type { Today } from "@/lib/models/Today";
import GreetingModule from "./GreetingModule";
import ReflectionModule from "./ReflectionModule";
import EchoModule from "./EchoModule";
import DailyInsightsModule from "./DailyInsightsModule";
import TodayWeeklyFocusModule from "./TodayWeeklyFocusModule";
import IntentionModule from "./IntentionModule";
import DailyHabitsModule, { type DailyHabitItem } from "./DailyHabitsModule";
import FooterModule from "./FooterModule";
import type { Insight } from "@/lib/domain/insights/insight";
import type { Echo } from "@/lib/domain/memory/echo";

export interface TodayModuleProps {
  today: Today;
  dailyHabits?: DailyHabitItem[];
  onHabitToggle?: (habitId: string) => void;
  intention?: string;
  onSaveIntention?: (value: string) => void;
  insight?: Insight | null;
  echo?: Echo | null;
  weeklyFocusAreaTitle?: string | null;
  displayName?: string | null;
  hydrated?: boolean;
  personalMotto?: string | null;
}

export interface TodayModule {
  id: string;
  title: string;
  order: number;
  enabled: boolean;
  component: ComponentType<TodayModuleProps>;
}

// Order follows the page's intended arc: arrival (greeting, a line for
// today, and rarely something from the past) -> what is true about today ->
// intention -> action. The echo sits directly after the daily reflection
// rather than further down: it is the rarest thing this screen can show,
// and burying it under routine acknowledgment would waste it.
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
    id: "echo",
    title: "Something you wrote",
    order: 2,
    enabled: true,
    component: EchoModule,
  },
  {
    id: "daily-insights",
    title: "Today's insight",
    order: 3,
    enabled: true,
    component: DailyInsightsModule,
  },
  {
    id: "weekly-focus",
    title: "Weekly focus area",
    order: 4,
    enabled: true,
    component: TodayWeeklyFocusModule,
  },
  {
    id: "intention",
    title: "Intention",
    order: 5,
    enabled: true,
    component: IntentionModule,
  },
  {
    id: "daily-habits",
    title: "Ritual del día",
    order: 6,
    enabled: true,
    component: DailyHabitsModule,
  },
  {
    id: "footer",
    title: "Footer",
    order: 7,
    enabled: true,
    component: FooterModule,
  },
];

export default todayModules;
