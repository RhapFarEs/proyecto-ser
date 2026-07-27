"use client";

import { useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import EmptyState from "@/components/ui/EmptyState";
import { Body, Caption } from "@/components/ui/Typography";
import type { Day } from "@/lib/domain/day/day";
import type { JournalEntry } from "@/lib/domain/entry/entry";
import { hasClosingReflection } from "@/lib/domain/day/day-reflection";
import { getJournalNotesForDay } from "@/lib/domain/day/day-journal";
import { formatDateKeyLabel } from "@/lib/date";

const TIME_FORMAT = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
});

type HistoryDayItem = {
  day: Day;
  notes: JournalEntry[];
  hasClosing: boolean;
};

function getHistoryItems(days: Day[]): HistoryDayItem[] {
  return days
    .map((day) => ({
      day,
      notes: getJournalNotesForDay(day),
      hasClosing: hasClosingReflection(day),
    }))
    .filter((item) => item.notes.length > 0 || item.hasClosing);
}

function getToggleLabel(noteCount: number, isExpanded: boolean): string {
  if (isExpanded) {
    return "Ocultar";
  }

  return noteCount === 1 ? "Ver nota" : `Ver ${noteCount} notas`;
}

type JournalHistoryModuleProps = {
  days: Day[];
};

export default function JournalHistoryModule({ days }: JournalHistoryModuleProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const historyItems = useMemo(() => getHistoryItems(days), [days]);

  if (historyItems.length === 0) {
    return (
      <EmptyState
        title="Aún no hay historial"
        description="Tus notas aparecerán aquí a medida que las escribas."
      />
    );
  }

  return (
    <div className="space-y-2">
      {historyItems.map(({ day, notes, hasClosing }) => {
        const isExpanded = expandedDay === day.id;
        const dateLabel = formatDateKeyLabel(day.date);
        const latestNote = notes[notes.length - 1];
        const notesId = `journal-history-notes-${day.id}`;

        return (
          <Card key={day.id} className="space-y-2">
            <div className="space-y-1">
              <Caption>{dateLabel}</Caption>
              {latestNote ? (
                <Body className="line-clamp-3 text-stone-300">{latestNote.content.trim()}</Body>
              ) : null}
              {hasClosing ? <Caption>Cierre del día registrado</Caption> : null}
            </div>

            {notes.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                aria-expanded={isExpanded}
                aria-controls={notesId}
                onClick={() => setExpandedDay(isExpanded ? null : day.id)}
              >
                {getToggleLabel(notes.length, isExpanded)}
              </Button>
            ) : null}

            {isExpanded && notes.length > 0 ? (
              <div id={notesId} className="border-t border-stone-800/80 pt-3">
                {notes.map((note, index) => (
                  <div key={note.id} className={index > 0 ? "mt-3" : ""}>
                    {index > 0 ? <Divider className="mb-3" /> : null}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Caption>{TIME_FORMAT.format(new Date(note.createdAt))}</Caption>
                        {note.mood ? <Caption>· {note.mood}</Caption> : null}
                      </div>
                      <Body className="text-stone-200">{note.content.trim()}</Body>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
