import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import { Body } from "@/components/ui/Typography";
import type { Day } from "@/lib/domain/day/day";
import type { Habit } from "@/lib/domain/habit/habit";
import { wroteOn } from "@/lib/domain/insights/insight-engine";
import { formatDateKeyLabel } from "@/lib/date";

type WeeklyContextModuleProps = {
  days?: Day[];
  habits?: Habit[];
  /** Which days hold notes. Notes live in their own store, not in the day. */
  dayKeysWithNotes?: ReadonlySet<string>;
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

const NO_NOTES: ReadonlySet<string> = new Set();

export default function WeeklyContextModule({
  days = [],
  habits = [],
  dayKeysWithNotes = NO_NOTES,
}: WeeklyContextModuleProps) {
  // Asking the day record alone answered "nobody wrote this week" for every
  // week since notes moved out of it — see `wroteOn`.
  const journalDates = days
    .filter((day) => wroteOn(day, dayKeysWithNotes))
    .map((day) => formatDateKeyLabel(day.date));

  const sustainedPractices = getSustainedPractices(days, habits);

  const hasContext = journalDates.length > 0 || sustainedPractices.length > 0;

  if (!hasContext) {
    return null;
  }

  return (
    <Section>
      <Card className="space-y-3">
        <SectionTitle>Esta semana</SectionTitle>

        {journalDates.length > 0 ? (
          <Body className="text-ink">
            Escribiste en tu diario: {journalDates.join(", ")}.
          </Body>
        ) : null}

        {sustainedPractices.length > 0 ? (
          <Body className="text-ink">Sostuviste: {sustainedPractices.join(", ")}.</Body>
        ) : null}
      </Card>
    </Section>
  );
}
