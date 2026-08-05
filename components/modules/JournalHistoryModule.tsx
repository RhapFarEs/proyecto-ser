"use client";

import { useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import EmptyState from "@/components/ui/EmptyState";
import { Body, Caption } from "@/components/ui/Typography";
import type { JournalHistoryDay } from "@/lib/domain/day/day-history";
import { formatDateKeyLabel } from "@/lib/date";

const TIME_FORMAT = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * How many days are drawn before asking.
 *
 * Roughly a month, which is as far back as anyone scrolls without meaning
 * to. The rest is not hidden — it is one press away — but someone who
 * writes daily for five years should not wait for eighteen hundred cards to
 * render in order to read last Tuesday.
 */
const PAGE_SIZE = 30;

function getToggleLabel(noteCount: number, isExpanded: boolean): string {
  if (isExpanded) {
    return "Ocultar";
  }

  return noteCount === 1 ? "Ver nota" : `Ver ${noteCount} notas`;
}

type JournalHistoryModuleProps = {
  /** Already built and ordered newest first — see `buildJournalHistory`. */
  items: JournalHistoryDay[];
};

export default function JournalHistoryModule({ items }: JournalHistoryModuleProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const historyItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const remaining = items.length - historyItems.length;

  if (items.length === 0) {
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
                <Body className="line-clamp-3 ser-voice text-ink-soft">
                  {latestNote.content.trim()}
                </Body>
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
              <div id={notesId} className="border-t border-line pt-3">
                {notes.map((note, index) => (
                  <div key={note.id} className={index > 0 ? "mt-3" : ""}>
                    {index > 0 ? <Divider className="mb-3" /> : null}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Caption>{TIME_FORMAT.format(new Date(note.createdAt))}</Caption>
                        {note.mood ? <Caption>· {note.mood}</Caption> : null}
                      </div>
                      <Body className="ser-voice text-ink">{note.content.trim()}</Body>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        );
      })}

      {remaining > 0 ? (
        <div className="flex flex-col items-center gap-1 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
          >
            Ver días anteriores
          </Button>
          <Caption>
            {remaining === 1 ? "Queda 1 día más" : `Quedan ${remaining} días más`}
          </Caption>
        </div>
      ) : null}
    </div>
  );
}
