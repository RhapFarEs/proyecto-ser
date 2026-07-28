"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Page from "@/components/ui/Page";
import JournalHistoryModule from "@/components/modules/JournalHistoryModule";
import journalModules from "@/components/modules/journal.config";
import { Caption } from "@/components/ui/Typography";
import { createDay, type Day } from "@/lib/domain/day/day";
import { getAllDays, getDay, updateDay } from "@/lib/domain/day/day-storage";
import { hasClosingReflection } from "@/lib/domain/day/day-reflection";
import {
  addJournalNote,
  deleteJournalNote,
  getJournalNotesForDay,
} from "@/lib/domain/day/day-journal";
import { getOwnMoodVocabulary } from "@/lib/domain/journal/journal-vocabulary";
import { getLocalDateKey } from "@/lib/date";
import { useClientState } from "@/lib/hooks/useClientState";
import { useHydrated } from "@/lib/hooks/useHydrated";


export default function JournalView() {
  const todayDate = getLocalDateKey();
  const hydrated = useHydrated();
  const [day, setDayState] = useClientState<Day>(() => getDay(todayDate), createDay(todayDate));
  const [activeTab, setActiveTab] = useState<"write" | "history">("write");

  const todayNotes = getJournalNotesForDay(day);

  const handleSaveNote = (mood: string, content: string) => {
    const next = updateDay(todayDate, (current) => addJournalNote(current, mood, content));
    setDayState(next);
  };

  const handleDeleteNote = (noteId: string) => {
    const next = updateDay(todayDate, (current) => deleteJournalNote(current, noteId));
    setDayState(next);
  };

  // Their words replace the product's suggested ones once they have any.
  const ownMoods = hydrated ? getOwnMoodVocabulary() : [];

  const visibleModules = [...journalModules]
    .filter((module) => module.enabled)
    .sort((left, right) => left.order - right.order);

  const storedDays = useMemo(() => {
    if (!hydrated) {
      return [];
    }

    // `day` is the live copy of today's record — swap it in over the stored
    // snapshot so a note saved a moment ago shows up in the history tab
    // immediately, without waiting for a storage re-read.
    return getAllDays()
      .map((stored) => (stored.id === day.id ? day : stored))
      .filter(
        (candidate) =>
          getJournalNotesForDay(candidate).length > 0 || hasClosingReflection(candidate),
      );
  }, [hydrated, day]);

  return (
    <Page title="Diario" subtitle="Escribe con honestidad. Nadie te está juzgando.">
      <div className="flex justify-center">
        <div className="inline-flex gap-2 rounded-full border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              activeTab === "write" ? "bg-ink-strong text-ground" : "text-ink-soft"
            }`}
          >
            Escribir
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              activeTab === "history" ? "bg-ink-strong text-ground" : "text-ink-soft"
            }`}
          >
            Historial
          </button>
        </div>
      </div>

      <Link href="/weekly-review" className="inline-block w-fit">
        <Caption className="underline-offset-4 hover:text-ink-soft hover:underline">
          Revisión semanal
        </Caption>
      </Link>

      {activeTab === "write" ? (
        <div className="space-y-3">
          {visibleModules.map((module) => {
            const ModuleComponent = module.component;

            return (
              <ModuleComponent
                key={`${module.id}:${hydrated}`}
                todayNotes={todayNotes}
                onSaveNote={handleSaveNote}
                onDeleteNote={handleDeleteNote}
                ownMoods={ownMoods}
              />
            );
          })}
        </div>
      ) : (
        <JournalHistoryModule days={storedDays} />
      )}
    </Page>
  );
}
