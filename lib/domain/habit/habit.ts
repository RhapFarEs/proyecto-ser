export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const ALL_WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

export interface Habit {
  id: string;
  title: string;
  purpose: string;
  weekdays: Weekday[];
  active: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function createHabit(title: string, purpose: string, weekdays: Weekday[]): Habit {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title,
    purpose,
    weekdays,
    active: true,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function isHabitScheduledOn(habit: Habit, weekday: Weekday): boolean {
  return habit.weekdays.includes(weekday);
}
