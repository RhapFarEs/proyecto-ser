import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Body, Caption } from "@/components/ui/Typography";
import type { Habit, Weekday } from "@/lib/domain/habit/habit";

const WEEKDAY_LABELS: Record<Weekday, string> = {
  1: "Lu",
  2: "Ma",
  3: "Mi",
  4: "Ju",
  5: "Vi",
  6: "Sá",
  0: "Do",
};

const WEEKDAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

function formatWeekdays(weekdays: Weekday[]): string {
  if (weekdays.length === 7) {
    return "Todos los días";
  }

  if (weekdays.length === 0) {
    return "Sin días programados";
  }

  return WEEKDAY_ORDER.filter((day) => weekdays.includes(day))
    .map((day) => WEEKDAY_LABELS[day])
    .join(" · ");
}

type HabitListModuleProps = {
  habits: Habit[];
  onCreateNew: () => void;
  onEdit: (habit: Habit) => void;
  onToggleActive: (id: string) => void;
};

export default function HabitListModule({
  habits,
  onCreateNew,
  onEdit,
  onToggleActive,
}: HabitListModuleProps) {
  return (
    <div className="space-y-3">
      <Button type="button" variant="primary" onClick={onCreateNew}>
        Nuevo hábito
      </Button>

      {habits.length === 0 ? (
        <EmptyState
          title="Aún no tienes hábitos"
          description="Puedes crear el tuyo o elegir una sugerencia para empezar."
          action={
            <Button type="button" variant="secondary" onClick={onCreateNew}>
              Crear hábito
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => (
            <Card
              key={habit.id}
              className={`space-y-2 ${habit.active ? "" : "opacity-60"}`.trim()}
            >
              <div className="flex items-start justify-between gap-4">
                <Body className="text-stone-100">{habit.title}</Body>
                <Caption className="whitespace-nowrap">
                  {formatWeekdays(habit.weekdays)}
                  {habit.active ? "" : " · Archivado"}
                </Caption>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onEdit(habit)}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onToggleActive(habit.id)}
                >
                  {habit.active ? "Archivar" : "Activar"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
