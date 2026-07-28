"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import { Display, Caption } from "@/components/ui/Typography";
import { useAuth } from "@/lib/auth/AuthContext";

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = () => {
    setStarting(true);
    setError(null);

    signInWithGoogle().catch(() => {
      // Without this the button simply did nothing on failure, which reads
      // as a broken app on the very first screen a person ever sees.
      setError("No pudimos conectar con Google. Inténtalo de nuevo.");
      setStarting(false);
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ground px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <Display>Proyecto SER</Display>
          <Caption>Un lugar tranquilo para volver cada día.</Caption>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="primary"
            className="w-full"
            disabled={starting}
            onClick={handleSignIn}
          >
            {starting ? "Conectando…" : "Continuar con Google"}
          </Button>

          {error ? (
            <Caption className="text-ink-soft" role="alert">
              {error}
            </Caption>
          ) : null}
        </div>
      </div>
    </div>
  );
}
