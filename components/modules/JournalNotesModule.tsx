"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import ModuleHeader from "@/components/ui/ModuleHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import MoodSelector from "@/components/ui/MoodSelector";
import { Body, Caption } from "@/components/ui/Typography";
import type { JournalEntry } from "@/lib/domain/entry/entry";

const MOOD_SUGGESTIONS = [
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
};

export default function JournalNotesModule({
  todayNotes = [],
  onSaveNote,
}: JournalNotesModuleProps) {
  const [mood, setMood] = useState("");
  const [content, setContent] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  const canSave = content.trim().length > 0;

  const handleContentChange = (value: string) => {
    setContent(value);
    setJustSaved(false);
  };

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    onSaveNote?.(mood.trim(), content.trim());
    setContent("");
    setJustSaved(true);
  };

  const handleMoodSuggestion = (moodId: string) => {
    const suggestion = MOOD_SUGGESTIONS.find((option) => option.id === moodId);
    setMood(suggestion?.label ?? moodId);
  };

  const toggleExpanded = (noteId: string) => {
    setExpandedNoteId((current) => (current === noteId ? null : noteId));
  };

  // getJournalNotesForDay returns oldest first (the order they were
  // written, and what History's "latest note" preview logic relies on) —
  // reversed only here, for display, so today's list reads newest first.
  const notesNewestFirst = [...todayNotes].reverse();

  return (
    <section className="space-y-3">
      <ModuleHeader
        title="¿Cómo llegas hoy?"
        subtitle="Escribe lo que sientes, con tus propias palabras. Nunca estás limitado a una lista."
      />

      <Input
        value={mood}
        onChange={(event) => setMood(event.target.value)}
        placeholder="¿Cómo te sientes en este momento?"
      />

      <MoodSelector moods={MOOD_SUGGESTIONS} onChange={handleMoodSuggestion} />

      <TextArea
        value={content}
        onChange={(event) => handleContentChange(event.target.value)}
        placeholder="Empieza a escribir..."
      />

      <div className="flex items-center gap-3">
        <Button type="button" variant="primary" disabled={!canSave} onClick={handleSave}>
          Guardar nota
        </Button>

        {justSaved ? <Caption>Guardado.</Caption> : null}
      </div>

      {notesNewestFirst.length > 0 ? (
        <>
          <Divider />

          <div className="space-y-3">
            <SectionTitle>Notas de hoy</SectionTitle>

            <div className="space-y-2">
              {notesNewestFirst.map((note) => {
                const isExpanded = expandedNoteId === note.id;

                return (
                  <Card key={note.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(note.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Caption>{TIME_FORMAT.format(new Date(note.createdAt))}</Caption>
                        {note.mood ? <Caption>· {note.mood}</Caption> : null}
                      </div>
                      <Body className="text-zinc-100">
                        {isExpanded ? note.content : getPreview(note.content)}
                      </Body>
                    </button>
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
