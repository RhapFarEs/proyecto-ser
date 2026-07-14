import { useMemo, useState } from "react";

import Card from "@/components/ui/Card";
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

function getPreview(value: string) {
  return value.length > 120 ? `${value.slice(0, 120)}…` : value;
}

type JournalHistoryModuleProps = {
  days: Day[];
};

export default function JournalHistoryModule({ days }: JournalHistoryModuleProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const historyItems = useMemo(() => getHistoryItems(days), [days]);

  if (historyItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {historyItems.map(({ day, notes, hasClosing }) => {
        const isExpanded = expandedDay === day.id;
        const dateLabel = formatDateKeyLabel(day.date);
        const latestNote = notes[notes.length - 1];

        return (
          <Card key={day.id} className="space-y-3">
            <button
              type="button"
              onClick={() => setExpandedDay(isExpanded ? null : day.id)}
              className="w-full text-left"
            >
              <div className="space-y-1">
                <Caption>{dateLabel}</Caption>
                {latestNote ? (
                  <Body className="text-zinc-300">
                    {getPreview(latestNote.content.trim())}
                  </Body>
                ) : null}
                {hasClosing ? <Caption>Cierre del día registrado</Caption> : null}
              </div>
            </button>

            {isExpanded && notes.length > 0 ? (
              <div className="space-y-3 border-t border-zinc-800/80 pt-3">
                {notes.map((note) => (
                  <div key={note.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Caption>{TIME_FORMAT.format(new Date(note.createdAt))}</Caption>
                      {note.mood ? <Caption>· {note.mood}</Caption> : null}
                    </div>
                    <Body className="text-zinc-200">{note.content.trim()}</Body>
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
