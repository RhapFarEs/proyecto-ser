import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import Card from "@/components/ui/Card";
import ChecklistItem from "@/components/ui/ChecklistItem";
import type { Habit } from "@/lib/domain/habit/habit";

export type DailyHabitItem = {
  habit: Habit;
  completed: boolean;
};

type DailyHabitsModuleProps = {
  dailyHabits?: DailyHabitItem[];
  onHabitToggle?: (habitId: string) => void;
};

export default function DailyHabitsModule({
  dailyHabits = [],
  onHabitToggle,
}: DailyHabitsModuleProps) {
  if (dailyHabits.length === 0) {
    return null;
  }

  return (
    <Section>
      <Card className="space-y-2 sm:space-y-3">
        <SectionTitle>Ritual del día</SectionTitle>

        {dailyHabits.map(({ habit, completed }) => (
          <ChecklistItem
            key={habit.id}
            checked={completed}
            onClick={() => onHabitToggle?.(habit.id)}
          >
            {habit.title}
          </ChecklistItem>
        ))}
      </Card>
    </Section>
  );
}
