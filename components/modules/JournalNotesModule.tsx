"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import ModuleHeader from "@/components/ui/ModuleHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import UndoNotice from "@/components/ui/UndoNotice";
import MoodSelector from "@/components/ui/MoodSelector";
import { Body, Caption } from "@/components/ui/Typography";
import type { JournalEntry } from "@/lib/domain/entry/entry";
import { DRAFT_KEYS, useDraft } from "@/lib/hooks/useDraft";

/**
 * Only what a new installation offers, before it knows anything. The moment
 * someone has words of their own, theirs are the ones on screen — see
 * `ownMoods` below.
 */
const DEFAULT_MOOD_SUGGESTIONS = [
  { id: "calm", label: "Tranquilo" },
  { id: "grateful", label: "Agradecido" },
  { id: "tired", label: "Cansado" },
  { id: "hopeful", label: "Motivado" },
  { id: "confused", label: "Confundido" },
  { id: "frustrated", label: "Frustrado" },
];

const TIME_FORMAT = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
});

const PREVIEW_LENGTH = 120;

function getPreview(value: string): string {
  return value.length > PREVIEW_LENGTH ? `${value.slice(0, PREVIEW_LENGTH)}…` : value;
}

type JournalNotesModuleProps = {
  todayNotes?: JournalEntry[];
  onSaveNote?: (mood: string, content: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onEditNote?: (noteId: string, mood: string, content: string) => void;
  onRestoreNote?: (noteId: string) => void;
  /** The words this person actually uses, most-used first. */
  ownMoods?: string[];
};

export default function JournalNotesModule({
  todayNotes = [],
  onSaveNote,
  onDeleteNote,
  onEditNote,
  onRestoreNote,
  ownMoods = [],
}: JournalNotesModuleProps) {
  const [mood, setMood] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  /*
    The composer is also the editor, so the draft is scoped to whatever it is
    currently holding. Without that, an interrupted edit would come back as
    an ordinary draft with no memory of which note it belonged to, and saving
    it would file a second copy of a note that already exists. A scope that
    no longer matches is simply ignored, so an abandoned edit costs the edit
    rather than the archive.
  */
  const [content, setContent, discardContent] = useDraft(
    DRAFT_KEYS.journalNote,
    "",
    editingNoteId ?? "",
  );
  const [justSaved, setJustSaved] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [justDeletedId, setJustDeletedId] = useState<string | null>(null);

  const canSave = content.trim().length > 0;

  const handleContentChange = (value: string) => {
    setContent(value);
    setJustSaved(false);
  };

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    if (editingNoteId) {
      onEditNote?.(editingNoteId, mood.trim(), content.trim());
    } else {
      onSaveNote?.(mood.trim(), content.trim());
    }

    discardContent();
    setEditingNoteId(null);
    setContent("");
    setMood("");
    setJustSaved(true);
  };

  /** Brings a written note back into the composer, exactly as it was. */
  const startEditing = (noteId: string, noteMood: string, noteContent: string) => {
    setEditingNoteId(noteId);
    setMood(noteMood);
    setContent(noteContent);
    setJustSaved(false);
    setConfirmingDeleteId(null);
  };

  const cancelEditing = () => {
    discardContent();
    setEditingNoteId(null);
    setContent("");
    setMood("");
  };

  /**
   * Six words the product picked, until there are six the person picked.
   *
   * This is the difference between customization and ownership: nobody edits
   * a list, and there is no setting to find. Someone writes "en paz" often
   * enough and eventually "en paz" is simply there, where "Motivado" used to
   * be — and the emotional vocabulary on the screen is theirs rather than
   * ours. Two people who both write every night end up with two different
   * rows of words, which is what a well-worn object looks like.
   *
   * The defaults fill any remaining slots, so a first week is never a
   * near-empty row, and the transition is gradual instead of a switch.
   */
  const moodOptions = (() => {
    const fromTheirWords = ownMoods.slice(0, 6).map((label) => ({ id: label, label }));
    const used = new Set(fromTheirWords.map((option) => option.label.toLowerCase()));
    const filler = DEFAULT_MOOD_SUGGESTIONS.filter(
      (option) => !used.has(option.label.toLowerCase()),
    );

    return [...fromTheirWords, ...filler].slice(0, 6);
  })();

  const handleMoodSuggestion = (moodId: string) => {
    const suggestion = moodOptions.find((option) => option.id === moodId);
    setMood(suggestion?.label ?? moodId);
  };

  // "Guardado." used to sit there until the next keystroke, so a note saved
  // and left alone kept announcing itself. It says its one word and goes.
  useEffect(() => {
    if (!justSaved) {
      return;
    }

    const timer = window.setTimeout(() => setJustSaved(false), 2600);
    return () => window.clearTimeout(timer);
  }, [justSaved]);

  const toggleExpanded = (noteId: string) => {
    setExpandedNoteId((current) => (current === noteId ? null : noteId));
  };

  // `todayNotes` arrives oldest first (the order they were
  // written, and what History's "latest note" preview logic relies on) —
  // reversed only here, for display, so today's list reads newest first.
  const notesNewestFirst = [...todayNotes].reverse();

  return (
    <section className="space-y-2">
      <ModuleHeader
        title={editingNoteId ? "Estás corrigiendo una nota" : "¿Cómo llegas hoy?"}
        subtitle={
          editingNoteId
            ? "Sigue siendo la misma nota, escrita a la misma hora. Solo cambian las palabras."
            : "Escribe lo que sientes, con tus propias palabras. Nunca estás limitado a una lista."
        }
      />

      <Input
        value={mood}
        onChange={(event) => setMood(event.target.value)}
        placeholder="¿Cómo te sientes en este momento?"
      />

      <MoodSelector moods={moodOptions} onChange={handleMoodSuggestion} />

      <TextArea
        value={content}
        onChange={(event) => handleContentChange(event.target.value)}
        placeholder="Empieza a escribir..."
      />

      <div className="flex items-center gap-3">
        <Button type="button" variant="primary" disabled={!canSave} onClick={handleSave}>
          {editingNoteId ? "Guardar cambios" : "Guardar nota"}
        </Button>

        {editingNoteId ? (
          <Button type="button" variant="ghost" onClick={cancelEditing}>
            Cancelar
          </Button>
        ) : null}

        {/* Polite, not assertive: a confirmation should never interrupt. */}
        {justSaved ? (
          <Caption className="ser-settle-in" role="status" aria-live="polite">
            Guardado.
          </Caption>
        ) : null}

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
      </div>

      {notesNewestFirst.length > 0 ? (
        <>
          <Divider />

          <div className="space-y-2">
            <SectionTitle>Notas de hoy</SectionTitle>

            <div className="space-y-2">
              {notesNewestFirst.map((note) => {
                const isExpanded = expandedNoteId === note.id;

                const isConfirmingDelete = confirmingDeleteId === note.id;

                return (
                  <Card key={note.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(note.id)}
                      aria-expanded={isExpanded}
                      className="w-full rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-faint"
                    >
                      <div className="flex items-center gap-2">
                        <Caption>{TIME_FORMAT.format(new Date(note.createdAt))}</Caption>
                        {note.mood ? <Caption>· {note.mood}</Caption> : null}
                      </div>
                      {/* Written in serif, so read back in serif. */}
                      <Body className="ser-voice text-ink">
                        {isExpanded ? note.content : getPreview(note.content)}
                      </Body>
                    </button>

                    {/*
                      Two-step rather than a modal: deleting is irreversible,
                      so it needs a deliberate confirmation, but a dialog
                      box would be louder than anything else in this product.
                    */}
                    {onEditNote && !isConfirmingDelete && editingNoteId !== note.id ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => startEditing(note.id, note.mood, note.content)}
                      >
                        Editar
                      </Button>
                    ) : null}

                    {onDeleteNote && editingNoteId !== note.id ? (
                      isConfirmingDelete ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <Caption>¿Eliminar esta nota?</Caption>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              onDeleteNote(note.id);
                              setConfirmingDeleteId(null);
                              setJustDeletedId(note.id);
                            }}
                          >
                            Eliminar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setConfirmingDeleteId(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setConfirmingDeleteId(note.id)}
                        >
                          Eliminar
                        </Button>
                      )
                    ) : null}
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
