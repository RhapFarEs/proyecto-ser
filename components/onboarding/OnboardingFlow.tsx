"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Display, Body, Caption } from "@/components/ui/Typography";
import { useAuth } from "@/lib/auth/AuthContext";
import { updateProfile } from "@/lib/domain/profile/profile-storage";
import type { Profile } from "@/lib/domain/profile/profile";

type OnboardingStep = "welcome" | "name" | "intro";

type OnboardingFlowProps = {
  user: User;
  profile: Profile;
};

/**
 * Shown once per account, gated by `profile.onboardingCompleted` (see
 * `OnboardingGate`). Three short steps — welcome, name, a three-concept
 * introduction — ending in "Comenzar", which is the only point any of
 * this writes to the profile.
 */
export default function OnboardingFlow({ user, profile }: OnboardingFlowProps) {
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  const trimmedName = displayName.trim();

  const handleFinish = () => {
    if (!trimmedName) {
      return;
    }

    setFinishing(true);
    setFinishError(null);

    updateProfile(user.id, (current) => ({
      ...current,
      displayName: trimmedName,
      onboardingCompleted: true,
    }))
      .then((updated) => {
        if (!updated) {
          setFinishError("No pudimos guardar tu perfil. Vuelve a intentarlo.");
          setFinishing(false);
          return;
        }

        return refreshProfile();
      })
      .catch(() => {
        setFinishError("No pudimos guardar tu perfil. Vuelve a intentarlo.");
        setFinishing(false);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ground px-6">
      <div className="w-full max-w-sm space-y-8">
        {step === "welcome" ? (
          <div className="space-y-8 text-center">
            <Display>Proyecto SER</Display>

            <div className="space-y-4 text-left">
              <Body className="text-ink-soft">
                Proyecto SER es un lugar tranquilo para volver cada día.
              </Body>
              <Body className="text-ink-soft">
                No mide tu productividad ni compara tus días. Solo te acompaña
                mientras vives, escribes y sostienes lo que te importa.
              </Body>
              <Body className="text-ink-soft">
                No hay prisa aquí. Puedes ir a tu propio ritmo.
              </Body>
            </div>

            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={() => setStep("name")}
            >
              Continuar
            </Button>
          </div>
        ) : null}

        {step === "name" ? (
          <div className="space-y-6 text-center">
            <div className="space-y-3">
              <Display className="text-2xl sm:text-3xl">
                ¿Cómo quieres que te llamemos?
              </Display>
              <Caption>Puedes cambiarlo cuando quieras desde tu perfil.</Caption>
            </div>

            <Input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Tu nombre"
              aria-label="¿Cómo quieres que te llamemos?"
              className="text-center"
            />

            <Button
              type="button"
              variant="primary"
              className="w-full"
              disabled={!trimmedName}
              onClick={() => setStep("intro")}
            >
              Continuar
            </Button>
          </div>
        ) : null}

        {step === "intro" ? (
          <div className="space-y-8 text-center">
            <Display className="text-2xl sm:text-3xl">Un vistazo rápido</Display>

            <div className="space-y-5 text-left">
              <div className="space-y-1">
                <Body className="text-ink">Hoy</Body>
                <Caption>Tu intención y tus prácticas de cada día.</Caption>
              </div>

              <div className="space-y-1">
                <Body className="text-ink">Diario</Body>
                <Caption>Un espacio para escribir con honestidad, sin juicio.</Caption>
              </div>

              <div className="space-y-1">
                <Body className="text-ink">Prácticas</Body>
                <Caption>Prácticas pequeñas que sostienes con constancia.</Caption>
              </div>
            </div>

            {finishError ? <Caption className="text-ink-soft">{finishError}</Caption> : null}

            <Button
              type="button"
              variant="primary"
              className="w-full"
              disabled={finishing}
              onClick={handleFinish}
            >
              {finishing ? "Guardando..." : "Comenzar"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
