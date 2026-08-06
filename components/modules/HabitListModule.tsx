import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ConfirmButton from "@/components/ui/ConfirmButton";
import EmptyState from "@/components/ui/EmptyState";
import UndoNotice from "@/components/ui/UndoNotice";
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
  onDelete: (id: string) => void;
  /** The practice just removed, if the offer to take it back still stands. */
  justDeletedId: string | null;
  onRestore: (id: string) => void;
  onDismissUndo: () => void;
};

export default function HabitListModule({
  habits,
  onCreateNew,
  onEdit,
  onToggleActive,
  onDelete,
  justDeletedId,
  onRestore,
  onDismissUndo,
}: HabitListModuleProps) {
  return (
    <div className="space-y-3">
      <Button type="button" variant="primary" onClick={onCreateNew}>
        Nuevo hábito
      </Button>

      {/* Above the list: the card it refers to has just left, so anchoring
          the offer to a row would put it wherever the gap happened to be. */}
      {justDeletedId ? (
        <UndoNotice
          key={justDeletedId}
          message="Práctica eliminada."
          onUndo={() => onRestore(justDeletedId)}
          onDismiss={onDismissUndo}
        />
      ) : null}

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
                <Body className="text-ink">{habit.title}</Body>
                <Caption className="whitespace-nowrap">
                  {formatWeekdays(habit.weekdays)}
                  {habit.active ? "" : " · Archivado"}
                </Caption>
              </div>

              <div className="flex flex-wrap items-center gap-2">
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

                <ConfirmButton
                  label="Eliminar"
                  question="¿Eliminar esta práctica?"
                  onConfirm={() => onDelete(habit.id)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
