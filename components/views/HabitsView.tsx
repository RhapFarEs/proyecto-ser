"use client";

import { useState } from "react";

import Page from "@/components/ui/Page";
import HabitListModule from "@/components/modules/HabitListModule";
import HabitFormModule, {
  type HabitFormValues,
} from "@/components/modules/HabitFormModule";
import type { Habit } from "@/lib/domain/habit/habit";
import { createHabit } from "@/lib/domain/habit/habit";
import {
  getHabits,
  removeHabit,
  restoreHabit,
  saveHabit,
  updateHabit,
} from "@/lib/domain/habit/habit-storage";
import { useClientState } from "@/lib/hooks/useClientState";

type HabitsMode = "list" | "form";

export default function HabitsView() {
  const [habits, setHabits] = useClientState<Habit[]>(() => getHabits(), []);
  const [mode, setMode] = useState<HabitsMode>("list");
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [justDeletedId, setJustDeletedId] = useState<string | null>(null);

  const openCreateForm = () => {
    setEditingHabit(null);
    setMode("form");
  };

  const openEditForm = (habit: Habit) => {
    setEditingHabit(habit);
    setMode("form");
  };

  const closeForm = () => {
    setEditingHabit(null);
    setMode("list");
  };

  const handleToggleActive = (id: string) => {
    updateHabit(id, (habit) => ({ ...habit, active: !habit.active }));
    setHabits(getHabits());
  };

  const handleDelete = (id: string) => {
    removeHabit(id);
    setHabits(getHabits());
    setJustDeletedId(id);
  };

  const handleRestore = (id: string) => {
    restoreHabit(id);
    setHabits(getHabits());
    setJustDeletedId(null);
  };

  const handleSubmit = (values: HabitFormValues) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, (habit) => ({
        ...habit,
        title: values.title,
        purpose: values.purpose,
        weekdays: values.weekdays,
      }));
    } else {
      saveHabit(createHabit(values.title, values.purpose, values.weekdays));
    }

    setHabits(getHabits());
    closeForm();
  };

  const initialValues: HabitFormValues | null = editingHabit
    ? {
        title: editingHabit.title,
        purpose: editingHabit.purpose,
        weekdays: editingHabit.weekdays,
      }
    : null;

  return (
    <Page
      title="Hábitos"
      subtitle="Pequeñas prácticas, sostenidas con intención."
    >
      {mode === "list" ? (
        <HabitListModule
          habits={habits}
          onCreateNew={openCreateForm}
          onEdit={openEditForm}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
          justDeletedId={justDeletedId}
          onRestore={handleRestore}
          onDismissUndo={() => setJustDeletedId(null)}
        />
      ) : (
        <HabitFormModule
          initialValues={initialValues}
          isEditing={Boolean(editingHabit)}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}
    </Page>
  );
}
