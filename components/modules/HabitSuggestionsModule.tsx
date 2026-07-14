"use client";

import Button from "@/components/ui/Button";
import { Caption } from "@/components/ui/Typography";
import storage from "@/lib/storage/storage";
import { useClientState } from "@/lib/hooks/useClientState";
import type { Habit } from "@/lib/domain/habit/habit";
import {
  HABIT_SUGGESTIONS,
  type HabitSuggestion,
  type HabitSuggestionCategory,
} from "@/lib/domain/habit/habit-suggestions";

const CATEGORY_ORDER: HabitSuggestionCategory[] = [
  "Cuerpo",
  "Mente",
  "Relaciones",
  "Espíritu",
  "Orden",
];

const EXPANDED_STORAGE_KEY = "ser.habits.suggestions-expanded";

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

type HabitSuggestionsModuleProps = {
  habits: Habit[];
  onSelect: (suggestion: HabitSuggestion) => void;
};

export default function HabitSuggestionsModule({
  habits,
  onSelect,
}: HabitSuggestionsModuleProps) {
  const [expanded, setExpanded] = useClientState<boolean>(() => {
    const stored = storage.get<boolean>(EXPANDED_STORAGE_KEY);

    if (stored !== undefined) {
      return stored;
    }

    // No remembered preference yet: default to expanded for a user with no
    // habits (they need somewhere to start) and collapsed otherwise, then
    // persist that default immediately — a remount right after saving the
    // first habit (list -> form -> list) must see a stable value, not
    // re-derive from `habits.length` again and flip shut on its own.
    const initial = habits.length === 0;
    storage.set(EXPANDED_STORAGE_KEY, initial);
    return initial;
  }, habits.length === 0);

  const existingTitles = new Set(habits.map((habit) => normalizeTitle(habit.title)));
  const availableSuggestions = HABIT_SUGGESTIONS.filter(
    (suggestion) => !existingTitles.has(normalizeTitle(suggestion.title)),
  );

  if (availableSuggestions.length === 0) {
    return null;
  }

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    storage.set(EXPANDED_STORAGE_KEY, next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Caption>¿Buscas inspiración?</Caption>
        <Button type="button" variant="ghost" onClick={toggleExpanded}>
          {expanded ? "Ocultar ideas" : "Ver ideas"}
        </Button>
      </div>

      {expanded ? (
        <div className="space-y-3 rounded-[1.75rem] border border-zinc-800/60 bg-zinc-950/40 p-4">
          {CATEGORY_ORDER.map((category) => {
            const items = availableSuggestions.filter(
              (suggestion) => suggestion.category === category,
            );

            if (items.length === 0) {
              return null;
            }

            return (
              <div key={category} className="space-y-2">
                <Caption>{category}</Caption>
                <div className="flex flex-wrap gap-2">
                  {items.map((suggestion) => (
                    <button
                      key={suggestion.title}
                      type="button"
                      onClick={() => onSelect(suggestion)}
                      className="rounded-full border border-zinc-800/60 bg-zinc-950/60 px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900/60 hover:text-zinc-100"
                    >
                      {suggestion.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
