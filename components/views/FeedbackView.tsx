"use client";

import { useState } from "react";

import { DRAFT_KEYS, useDraft } from "@/lib/hooks/useDraft";
import { usePathname } from "next/navigation";

import Page from "@/components/ui/Page";
import Card from "@/components/ui/Card";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import MoodSelector from "@/components/ui/MoodSelector";
import { Body, Caption } from "@/components/ui/Typography";
import { useAuth } from "@/lib/auth/AuthContext";
import { createFeedback, type FeedbackCategory } from "@/lib/domain/feedback/feedback";
import { submitFeedback } from "@/lib/domain/feedback/feedback-storage";
import { captureFeedbackContext } from "@/lib/domain/feedback/feedback-context";

const CATEGORY_OPTIONS: { id: FeedbackCategory; label: string }[] = [
  { id: "error", label: "Error" },
  { id: "idea", label: "Idea" },
  { id: "confusing", label: "Algo fue confuso" },
  { id: "other", label: "Otro" },
];

export default function FeedbackView() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [message, setMessage, discardMessage] = useDraft(DRAFT_KEYS.feedback, "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const canSubmit = Boolean(category) && message.trim().length > 0 && !sending;

  const handleSubmit = () => {
    if (!user || !category || !canSubmit) {
      return;
    }

    setSending(true);
    setError(null);

    const context = captureFeedbackContext(pathname, navigator.userAgent);
    const feedback = createFeedback(user.id, category, message.trim(), context);

    submitFeedback(feedback)
      .then(() => {
        setSent(true);
        discardMessage();
        setMessage("");
      })
      .catch(() => {
        // The message stays in the textarea on purpose — losing what
        // someone just wrote because the network failed would be worse
        // than the failure itself.
        setError(
          "No pudimos enviar tu comentario. Tu texto sigue aquí; puedes volver a intentarlo.",
        );
      })
      .finally(() => {
        setSending(false);
      });
  };

  const handleSendAnother = () => {
    setSent(false);
    setCategory(null);
    setError(null);
  };

  if (!user) {
    return null;
  }

  return (
    <Page
      title="Ayudar a mejorar Proyecto SER"
      subtitle="Proyecto SER todavía está creciendo. Si encontraste algo confuso, un error o tienes una idea, me encantará leerla."
    >
      <Card className="space-y-4">
        {sent ? (
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <Body className="text-ink">Gracias.</Body>
              <Body className="text-ink">Tu comentario fue enviado correctamente.</Body>
            </div>

            <Button type="button" variant="secondary" onClick={handleSendAnother}>
              Enviar otro
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Caption>Categoría</Caption>
              <MoodSelector
                moods={CATEGORY_OPTIONS}
                selected={category ?? undefined}
                onChange={(value) => setCategory(value as FeedbackCategory)}
              />
            </div>

            <TextArea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Cuéntame qué ocurrió o qué te gustaría mejorar."
              aria-label="Cuéntame qué ocurrió o qué te gustaría mejorar"
              className="min-h-[160px]"
            />

            {error ? <Caption className="text-ink-soft">{error}</Caption> : null}

            <Button type="button" variant="primary" disabled={!canSubmit} onClick={handleSubmit}>
              {sending ? "Enviando…" : "Enviar comentario"}
            </Button>
          </>
        )}
      </Card>
    </Page>
  );
}
