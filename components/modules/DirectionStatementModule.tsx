"use client";

import { useId, useState } from "react";

import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import SavedNotice from "@/components/ui/SavedNotice";
import { Body, Caption } from "@/components/ui/Typography";
import { formatDateKeyLongLabel, getLocalDateKey } from "@/lib/date";
import type { DirectionRevision } from "@/lib/domain/direction/direction";
import { DRAFT_KEYS, useDraft } from "@/lib/hooks/useDraft";

type DirectionStatementModuleProps = {
  statement?: string;
  /** Everything written before the current statement, newest first. */
  history?: DirectionRevision[];
  onSave?: (statement: string) => void;
};

/** The revision's own date, read in the reader's timezone rather than UTC. */
function revisionDate(revision: DirectionRevision): string {
  return formatDateKeyLongLabel(getLocalDateKey(new Date(revision.createdAt)));
}

export default function DirectionStatementModule({
  statement = "",
  history = [],
  onSave,
}: DirectionStatementModuleProps) {
  const [draft, setDraft, discardDraft] = useDraft(DRAFT_KEYS.direction, statement);
  const [savedAt, setSavedAt] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const historyId = useId();

  const handleSave = () => {
    onSave?.(draft.trim());
    discardDraft();
    setSavedAt(Date.now());
  };

  return (
    <Section>
      <Card className="space-y-4 sm:space-y-5">
        <SectionTitle>Dirección personal</SectionTitle>

        <Body className="text-ink">¿Hacia qué tipo de vida quiero caminar?</Body>

        <TextArea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escribe con calma. Puedes dejarlo así por ahora."
          aria-label="¿Hacia qué tipo de vida quiero caminar?"
          className="min-h-[140px]"
        />

        <div className="flex items-center gap-3">
          <Button type="button" variant="primary" onClick={handleSave}>
            Guardar
          </Button>

          {savedAt ? (
            <SavedNotice key={savedAt} onDismiss={() => setSavedAt(0)} />
          ) : null}
        </div>

        {/*
          Nothing appears here until there is something to show. On the day
          someone writes their direction for the first time this screen looks
          exactly as it did before — the history is a thing the archive grows
          into, not a feature announcing itself on an empty page.
        */}
        {history.length > 0 ? (
          <div className="border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setShowHistory((visible) => !visible)}
              aria-expanded={showHistory}
              aria-controls={historyId}
              className="ser-field -mx-2 px-2 py-1 text-sm text-ink-faint transition-colors hover:text-ink-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-faint"
            >
              {showHistory ? "Ocultar lo anterior" : "Lo que escribiste antes"}
            </button>

            {/*
              The statements themselves, and their dates. No differences
              highlighted, no count of how many times someone changed their
              mind: comparing a person's beliefs to each other is a verdict,
              and this screen only holds evidence.
            */}
            {showHistory ? (
              <ul id={historyId} className="mt-4 space-y-5">
                {history.map((revision) => (
                  <li key={revision.id} className="space-y-1">
                    <Body className="ser-voice text-ink">{revision.statement}</Body>
                    <Caption>{revisionDate(revision)}</Caption>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </Card>
    </Section>
  );
}
