"use client";

import { useState } from "react";

import Page from "@/components/ui/Page";
import HabitListModule from "@/components/modules/HabitListModule";
import HabitSuggestionsModule from "@/components/modules/HabitSuggestionsModule";
import HabitFormModule, {
  type HabitFormValues,
} from "@/components/modules/HabitFormModule";
import type { Habit } from "@/lib/domain/habit/habit";
import { createHabit } from "@/lib/domain/habit/habit";
import type { HabitSuggestion } from "@/lib/domain/habit/habit-suggestions";
import { getHabits, saveHabit, updateHabit } from "@/lib/domain/habit/habit-storage";
import { useClientState } from "@/lib/hooks/useClientState";

type HabitsMode = "list" | "form";

export default function HabitsView() {
  const [habits, setHabits] = useClientState<Habit[]>(() => getHabits(), []);
  const [mode, setMode] = useState<HabitsMode>("list");
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [suggestionValues, setSuggestionValues] = useState<HabitFormValues | null>(null);

  const openCreateForm = () => {
    setEditingHabit(null);
    setSuggestionValues(null);
    setMode("form");
  };

  const openEditForm = (habit: Habit) => {
    setEditingHabit(habit);
    setSuggestionValues(null);
    setMode("form");
  };

  const openSuggestionForm = (suggestion: HabitSuggestion) => {
    setEditingHabit(null);
    setSuggestionValues({
      title: suggestion.title,
      purpose: suggestion.purpose,
      weekdays: suggestion.weekdays,
    });
    setMode("form");
  };

  const closeForm = () => {
    setEditingHabit(null);
    setSuggestionValues(null);
    setMode("list");
  };

  const handleToggleActive = (id: string) => {
    updateHabit(id, (habit) => ({ ...habit, active: !habit.active }));
    setHabits(getHabits());
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
    : suggestionValues;

  return (
    <Page
      title="Hábitos"
      subtitle="Pequeñas prácticas, sostenidas con intención."
    >
      {mode === "list" ? (
        <div className="space-y-6">
          <HabitSuggestionsModule habits={habits} onSelect={openSuggestionForm} />
          <HabitListModule
            habits={habits}
            onCreateNew={openCreateForm}
            onEdit={openEditForm}
            onToggleActive={handleToggleActive}
          />
        </div>
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
