"use client";

import Link from "next/link";

import Page from "@/components/ui/Page";
import SectionTitle from "@/components/ui/SectionTitle";
import { Body, Caption } from "@/components/ui/Typography";
import AtmosphereChooser from "@/components/atmosphere/AtmosphereChooser";
import { useAuth } from "@/lib/auth/AuthContext";
import { APP_VERSION } from "@/lib/domain/feedback/feedback-context";
import { getLocalDateKey } from "@/lib/date";
import { buildArchiveDocument } from "@/lib/domain/archive/archive";
import { gatherArchive } from "@/lib/domain/archive/archive-storage";

/*
  `ser-card`, not a hardcoded radius. These rows are cards and have to age
  with every other card: at 1.75rem they stayed soft in Piedra and Carbón
  while the rest of the product went architectural, which made Más look like
  a screen from a different application.
*/
const rowClassName =
  "ser-card block w-full border border-line bg-surface p-5 text-left backdrop-blur-sm transition-colors hover:bg-surface-raised sm:p-6";

export default function MorePage() {
  const { profile, changeAccount, signOut } = useAuth();

  /*
    Everything they have written, as a file they keep.

    CONSTITUTION.md, Fourth Law: their words leave whenever they want, and
    leaving is never made difficult, slow or lossy. It is deliberately one
    press with no confirmation and no explanation of what they are about to
    lose — a product that makes you justify taking your own writing with you
    has already decided it owns it.

    Built entirely on the device, from local storage, so it works with no
    network. A record you can only retrieve while online is not one you fully
    hold.
  */
  const handleExport = () => {
    const exportedAt = getLocalDateKey();
    const text = buildArchiveDocument(
      gatherArchive(
        profile ? { displayName: profile.displayName, startedAt: profile.startedAt } : null,
        exportedAt,
      ),
    );

    const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");

    link.href = url;
    link.download = `proyecto-ser-${exportedAt}.md`;
    // Attached before clicking: some browsers ignore a click on an anchor
    // that was never in the document.
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

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

            <button type="button" className={rowClassName} onClick={handleExport}>
              <div className="space-y-1">
                <Body className="text-ink">Descargar mi archivo</Body>
                <Caption>
                  Todo lo que has escrito, en un archivo que puedes leer sin la aplicación.
                </Caption>
              </div>
            </button>

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
