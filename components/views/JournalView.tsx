"use client";

import { useState } from "react";
import Link from "next/link";

import Page from "@/components/ui/Page";
import JournalHistoryModule from "@/components/modules/JournalHistoryModule";
import journalModules from "@/components/modules/journal.config";
import { Caption } from "@/components/ui/Typography";
import { getAllDays, updateDay } from "@/lib/domain/day/day-storage";
import type { JournalEntry } from "@/lib/domain/entry/entry";
import { addJournalNote } from "@/lib/domain/day/day-journal";
import {
  buildJournalHistory,
  groupJournalNotesByDayKey,
  type JournalHistoryDay,
} from "@/lib/domain/day/day-history";
import {
  editJournalNote,
  getJournalNotes,
  removeJournalNote,
  restoreJournalNote,
} from "@/lib/domain/journal/journal-storage";
import { getOwnMoodVocabulary } from "@/lib/domain/journal/journal-vocabulary";
import { getLocalDateKey } from "@/lib/date";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useStoredValue } from "@/lib/hooks/useStoredValue";


const EMPTY_JOURNAL: {
  todayNotes: JournalEntry[];
  historyItems: JournalHistoryDay[];
  ownMoods: string[];
} = { todayNotes: [], historyItems: [], ownMoods: [] };

export default function JournalView() {
  const todayDate = getLocalDateKey();
  const hydrated = useHydrated();

  const [activeTab, setActiveTab] = useState<"write" | "history">("write");

  /*
    Everything this screen shows, read straight from the stores in one pass.

    Each of these used to scan the whole store independently — today's notes,
    the mood vocabulary, and the history tab twice over — and the history
    ones scanned it once per day, which is days × notes.

    Keyed on `storedData` rather than on today's record: notes live in their
    own store, so a note arriving from another device changes what this
    screen should show without touching the `Day` at all.
  */
  const { todayNotes, historyItems, ownMoods } = useStoredValue(() => {
    const notesByDayKey = groupJournalNotesByDayKey(getJournalNotes());

    return {
      todayNotes: notesByDayKey.get(todayDate) ?? [],
      historyItems: buildJournalHistory(getAllDays(), notesByDayKey),
      // Their words replace the product's suggested ones once they have any.
      ownMoods: getOwnMoodVocabulary(),
    };
  }, EMPTY_JOURNAL);

  const handleSaveNote = (mood: string, content: string) => {
    updateDay(todayDate, (current) => addJournalNote(current, mood, content));
  };

  /*
    Identified by note id, so these work on a note from any day. They used to
    be routed through `updateDay(todayDate, ...)`, which is what limited them
    to today and, incidentally, marked today as modified every time someone
    corrected a note written months ago.
  */
  const handleDeleteNote = (noteId: string) => {
    removeJournalNote(noteId);
  };

  const handleRestoreNote = (noteId: string) => {
    restoreJournalNote(noteId);
  };

  const handleEditNote = (noteId: string, mood: string, content: string) => {
    editJournalNote(noteId, mood, content);
  };

  const visibleModules = [...journalModules]
    .filter((module) => module.enabled)
    .sort((left, right) => left.order - right.order);

  return (
    <Page title="Diario" subtitle="Escribe con honestidad. Nadie te está juzgando.">
      <div className="flex justify-center">
        {/* Two toggles rather than an ARIA tablist: which one is on is the
            whole state, and `aria-pressed` says it without owing anyone the
            arrow-key handling a real tablist has to implement. */}
        <div className="inline-flex gap-2 rounded-full border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            aria-pressed={activeTab === "write"}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              activeTab === "write" ? "bg-ink-strong text-ground" : "text-ink-soft"
            }`}
          >
            Escribir
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            aria-pressed={activeTab === "history"}
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
                onEditNote={handleEditNote}
                onRestoreNote={handleRestoreNote}
                ownMoods={ownMoods}
              />
            );
          })}
        </div>
      ) : (
        <JournalHistoryModule
          items={historyItems}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          onRestoreNote={handleRestoreNote}
        />
      )}
    </Page>
  );
}
