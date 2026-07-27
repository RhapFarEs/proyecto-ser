import Link from "next/link";

import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import Card from "@/components/ui/Card";
import ChecklistItem from "@/components/ui/ChecklistItem";
import { Caption } from "@/components/ui/Typography";
import type { Habit } from "@/lib/domain/habit/habit";

export type DailyHabitItem = {
  habit: Habit;
  completed: boolean;
};

type DailyHabitsModuleProps = {
  dailyHabits?: DailyHabitItem[];
  onHabitToggle?: (habitId: string) => void;
  /** False only while the client cache is still loading, to avoid flashing the empty state. */
  hydrated?: boolean;
};

export default function DailyHabitsModule({
  dailyHabits = [],
  onHabitToggle,
  hydrated = true,
}: DailyHabitsModuleProps) {
  if (dailyHabits.length === 0) {
    // Rendering nothing left a brand-new user on a Today screen with no
    // hint that practices exist at all. An invitation, not a prompt to
    // fix something — nothing is missing if they'd rather not have any.
    if (!hydrated) {
      return null;
    }

    return (
      <Section>
        <Card className="space-y-2">
          <SectionTitle>Ritual del día</SectionTitle>

          <Caption>
            Aún no tienes prácticas para hoy.{" "}
            <Link
              href="/habits"
              className="underline underline-offset-4 transition-colors hover:text-zinc-300"
            >
              Puedes elegir una
            </Link>{" "}
            cuando sientas que es el momento.
          </Caption>
        </Card>
      </Section>
    );
  }

  return (
    <Section>
      <Card className="space-y-2 sm:space-y-3">
        <SectionTitle>Ritual del día</SectionTitle>

        {dailyHabits.map(({ habit, completed }) => (
          <ChecklistItem
            key={habit.id}
            checked={completed}
            note={habit.purpose}
            onClick={() => onHabitToggle?.(habit.id)}
          >
            {habit.title}
          </ChecklistItem>
        ))}
      </Card>
    </Section>
  );
}
