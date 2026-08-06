"use client";

import { useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ConfirmButton from "@/components/ui/ConfirmButton";
import Divider from "@/components/ui/Divider";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import UndoNotice from "@/components/ui/UndoNotice";
import { Body, Caption } from "@/components/ui/Typography";
import type { JournalHistoryDay } from "@/lib/domain/day/day-history";
import { formatDateKeyLabel } from "@/lib/date";
import { useHydrated } from "@/lib/hooks/useHydrated";

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
  onEditNote?: (noteId: string, mood: string, content: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onRestoreNote?: (noteId: string) => void;
};

export default function JournalHistoryModule({
  items,
  onEditNote,
  onDeleteNote,
  onRestoreNote,
}: JournalHistoryModuleProps) {
  const hydrated = useHydrated();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editMood, setEditMood] = useState("");
  const [editContent, setEditContent] = useState("");
  const [justDeletedId, setJustDeletedId] = useState<string | null>(null);

  const historyItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const remaining = items.length - historyItems.length;

  /*
    Deliberately not draft-backed, unlike the composer.

    Correcting an old note is a short, deliberate act rather than a writing
    session, and the composer's draft is keyed by the note being edited — so
    a draft here would either collide with that key or need a second one.
    Leaving mid-edit costs the correction, never the note.
  */
  const startEditing = (noteId: string, mood: string, content: string) => {
    setEditingNoteId(noteId);
    setEditMood(mood);
    setEditContent(content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditMood("");
    setEditContent("");
  };

  const saveEdit = () => {
    if (!editingNoteId || editContent.trim().length === 0) {
      return;
    }

    onEditNote?.(editingNoteId, editMood.trim(), editContent.trim());
    cancelEditing();
  };

  /*
    Before hydration every stored value is still its empty fallback, and this
    markup is what the server renders — so without this gate the first paint
    of a full archive is a screen saying there is nothing in it. Say nothing
    until the cache has been read.
  */
  if (items.length === 0) {
    if (!hydrated) {
      return null;
    }

    return (
      <EmptyState
        title="Aún no hay historial"
        description="Tus notas aparecerán aquí a medida que las escribas."
      />
    );
  }

  return (
    <div className="space-y-2">
      {/*
        Above the list rather than in the day it came from: deleting the only
        note of a day removes that day from the list entirely, and an offer
        rendered inside it would disappear with it. Matches where the
        practices and areas lists put theirs.
      */}
      {justDeletedId && onRestoreNote ? (
        <UndoNotice
          key={justDeletedId}
          message="Nota eliminada."
          onUndo={() => {
            onRestoreNote(justDeletedId);
            setJustDeletedId(null);
          }}
          onDismiss={() => setJustDeletedId(null)}
        />
      ) : null}

      {historyItems.map(({ day, notes }) => {
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
            </div>

            {notes.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                aria-expanded={isExpanded}
                aria-controls={notesId}
                onClick={() => {
                  setExpandedDay(isExpanded ? null : day.id);
                  cancelEditing();
                }}
              >
                {getToggleLabel(notes.length, isExpanded)}
              </Button>
            ) : null}

            {isExpanded && notes.length > 0 ? (
              <div id={notesId} className="border-t border-line pt-3">
                {notes.map((note, index) => (
                  <div key={note.id} className={index > 0 ? "mt-3" : ""}>
                    {index > 0 ? <Divider className="mb-3" /> : null}

                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <Caption>Estás corrigiendo una nota del {dateLabel}.</Caption>

                        <Input
                          value={editMood}
                          onChange={(event) => setEditMood(event.target.value)}
                          placeholder="¿Cómo te sentías?"
                          aria-label="¿Cómo te sentías?"
                        />

                        <TextArea
                          value={editContent}
                          onChange={(event) => setEditContent(event.target.value)}
                          aria-label="Tu nota"
                          className="min-h-[140px]"
                        />

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="primary"
                            disabled={editContent.trim().length === 0}
                            onClick={saveEdit}
                          >
                            Guardar cambios
                          </Button>
                          <Button type="button" variant="ghost" onClick={cancelEditing}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Caption>{TIME_FORMAT.format(new Date(note.createdAt))}</Caption>
                          {note.mood ? <Caption>· {note.mood}</Caption> : null}
                        </div>

                        <Body className="ser-voice text-ink">{note.content.trim()}</Body>

                        {onEditNote || onDeleteNote ? (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {onEditNote ? (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => startEditing(note.id, note.mood, note.content)}
                              >
                                Editar
                              </Button>
                            ) : null}

                            {onDeleteNote ? (
                              <ConfirmButton
                                label="Eliminar"
                                question="¿Eliminar esta nota?"
                                onConfirm={() => {
                                  onDeleteNote(note.id);
                                  setJustDeletedId(note.id);
                                }}
                              />
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    )}
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
