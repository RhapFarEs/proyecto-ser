import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import { Body } from "@/components/ui/Typography";
import type { Day } from "@/lib/domain/day/day";
import type { Habit } from "@/lib/domain/habit/habit";
import { hasClosingReflection } from "@/lib/domain/day/day-reflection";
import { formatDateKeyLabel } from "@/lib/date";

type WeeklyContextModuleProps = {
  days?: Day[];
  habits?: Habit[];
};

function getSustainedPractices(days: Day[], habits: Habit[]): string[] {
  const habitById = new Map(habits.map((habit) => [habit.id, habit]));
  const practices = new Set<string>();

  for (const day of days) {
    for (const entry of day.entries) {
      if (entry.type === "habit" && entry.completed) {
        const habit = habitById.get(entry.habitId);
        if (habit) {
          practices.add(habit.title);
        }
      }
    }
  }

  return Array.from(practices);
}

export default function WeeklyContextModule({
  days = [],
  habits = [],
}: WeeklyContextModuleProps) {
  const journalDates = days
    .filter((day) => day.entries.some((entry) => entry.type === "journal"))
    .map((day) => formatDateKeyLabel(day.date));

  const closingDates = days
    .filter((day) => hasClosingReflection(day))
    .map((day) => formatDateKeyLabel(day.date));

  const sustainedPractices = getSustainedPractices(days, habits);

  const hasContext =
    journalDates.length > 0 || closingDates.length > 0 || sustainedPractices.length > 0;

  if (!hasContext) {
    return null;
  }

  return (
    <Section>
      <Card className="space-y-3">
        <SectionTitle>Esta semana</SectionTitle>

        {journalDates.length > 0 ? (
          <Body className="text-stone-200">
            Escribiste en tu diario: {journalDates.join(", ")}.
          </Body>
        ) : null}

        {closingDates.length > 0 ? (
          <Body className="text-stone-200">Cerraste el día: {closingDates.join(", ")}.</Body>
        ) : null}

        {sustainedPractices.length > 0 ? (
          <Body className="text-stone-200">Sostuviste: {sustainedPractices.join(", ")}.</Body>
        ) : null}
      </Card>
    </Section>
  );
}
