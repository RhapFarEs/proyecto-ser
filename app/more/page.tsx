"use client";

import Link from "next/link";

import Page from "@/components/ui/Page";
import SectionTitle from "@/components/ui/SectionTitle";
import { Body, Caption } from "@/components/ui/Typography";
import AtmosphereChooser from "@/components/atmosphere/AtmosphereChooser";
import { useAuth } from "@/lib/auth/AuthContext";
import { APP_VERSION } from "@/lib/domain/feedback/feedback-context";

const rowClassName =
  "block w-full rounded-[1.75rem] border border-line bg-surface p-5 text-left backdrop-blur-sm transition-colors hover:bg-surface-raised sm:p-6";

export default function MorePage() {
  const { changeAccount, signOut } = useAuth();

  return (
    <Page title="Más" subtitle="Otras cosas que puedes revisar.">
      <div className="space-y-6">
        <div className="space-y-3">
          <SectionTitle>Espacios</SectionTitle>

          <div className="space-y-3">
            <Link href="/weekly-review" className={rowClassName}>
              <div className="space-y-1">
                <Body className="text-ink">Revisión semanal</Body>
                <Caption>Una mirada calmada a tu semana.</Caption>
              </div>
            </Link>

            <Link href="/direction" className={rowClassName}>
              <div className="space-y-1">
                <Body className="text-ink">Dirección personal</Body>
                <Caption>Hacia dónde quieres caminar.</Caption>
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <SectionTitle>Atmósfera</SectionTitle>
          <AtmosphereChooser />
        </div>

        <div className="space-y-3">
          <SectionTitle>Cuenta</SectionTitle>

          <div className="space-y-3">
            <Link href="/profile" className={rowClassName}>
              <Body className="text-ink">Perfil</Body>
            </Link>

            <button type="button" className={rowClassName} onClick={() => void changeAccount()}>
              <Body className="text-ink">Cambiar de cuenta</Body>
            </button>

            <button type="button" className={rowClassName} onClick={() => void signOut()}>
              <Body className="text-ink">Cerrar sesión</Body>
            </button>
          </div>
        </div>

        <Link href="/feedback" className={rowClassName}>
          <div className="space-y-1">
            <Body className="text-ink">Ayudar a mejorar Proyecto SER</Body>
            <Caption>Si algo fue confuso o tienes una idea, este es el lugar.</Caption>
          </div>
        </Link>

        <Caption className="text-center text-ink-faint">
          Proyecto SER · versión {APP_VERSION}
        </Caption>
      </div>
    </Page>
  );
}
