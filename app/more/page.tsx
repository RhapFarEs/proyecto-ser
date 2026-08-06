"use client";

import { useState } from "react";
import Link from "next/link";

import Page from "@/components/ui/Page";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SectionTitle from "@/components/ui/SectionTitle";
import { Body, Caption } from "@/components/ui/Typography";
import AtmosphereChooser from "@/components/atmosphere/AtmosphereChooser";
import { useAuth } from "@/lib/auth/AuthContext";
import { APP_VERSION } from "@/lib/domain/feedback/feedback-context";
import { getLocalDateKey } from "@/lib/date";
import { buildArchiveDocument } from "@/lib/domain/archive/archive";
import { gatherArchive } from "@/lib/domain/archive/archive-storage";
import { hasUnsavedDrafts } from "@/lib/hooks/useDraft";
import { deleteAccount, AccountDeletionError } from "@/lib/domain/profile/account-deletion";

/*
  `ser-card`, not a hardcoded radius. These rows are cards and have to age
  with every other card: at 1.75rem they stayed soft in Piedra and Carbón
  while the rest of the product went architectural, which made Más look like
  a screen from a different application.
*/
const rowClassName =
  "ser-card block w-full border border-line bg-surface p-5 text-left backdrop-blur-sm transition-colors hover:bg-surface-raised sm:p-6";

/**
 * Leaving an account, which is the one action in this product that destroys
 * writing: every draft is thrown away so unsaved words cannot appear in
 * front of whoever signs in next.
 *
 * It used to do that on a single tap with nothing said. So it asks — but
 * only when something is actually part-written, because a confirmation that
 * appears every time is one nobody reads by the third time, and there is
 * nothing to protect on the other days.
 */
function LeaveAccountRow({ label, onLeave }: { label: string; onLeave: () => void }) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button
        type="button"
        className={rowClassName}
        onClick={() => {
          if (hasUnsavedDrafts()) {
            setAsking(true);
            return;
          }

          onLeave();
        }}
      >
        <Body className="text-ink">{label}</Body>
      </button>
    );
  }

  return (
    <div className={rowClassName}>
      <div className="space-y-3">
        <div className="space-y-1">
          <Body className="text-ink">{label}</Body>
          {/* Said plainly, in the strongest ink: something will be lost. */}
          <Caption className="text-ink-strong">
            Tienes algo escrito que todavía no has guardado. Si sales ahora, se perderá.
          </Caption>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" onClick={onLeave}>
            Salir de todos modos
          </Button>
          <Button type="button" variant="ghost" onClick={() => setAsking(false)}>
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Typed rather than tapped, because this is the one thing that cannot be undone. */
const DELETE_CONFIRMATION = "eliminar";

/**
 * Leaving for good.
 *
 * Every other removal in SER is a tombstone with nine seconds to change your
 * mind. This one is not: it removes the account, everything written in it,
 * the profile photo, and the caches on this device, and nothing brings any of
 * it back. So it is the only place in the product that asks someone to type
 * something — two taps is the right weight for a note and the wrong weight
 * for a life's worth of writing.
 *
 * The offer to download the archive sits inside the warning rather than
 * somewhere else on the screen, because this is the last moment it is
 * possible.
 */
function DeleteAccountRow({ userId, onExport }: { userId: string; onExport: () => void }) {
  const [asking, setAsking] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete =
    confirmation.trim().toLowerCase() === DELETE_CONFIRMATION && !deleting;

  const handleDelete = () => {
    if (!canDelete) {
      return;
    }

    setDeleting(true);
    setError(null);

    deleteAccount(userId)
      .then(() => {
        // The session is closed inside `deleteAccount`, so AuthGate takes
        // over and shows the login screen. A full reload rather than a
        // route change, so nothing in memory outlives the account.
        window.location.replace("/");
      })
      .catch((cause: unknown) => {
        setError(
          cause instanceof AccountDeletionError
            ? cause.message
            : "No pudimos eliminar tu cuenta. No se ha borrado nada.",
        );
        setDeleting(false);
      });
  };

  if (!asking) {
    return (
      <button type="button" className={rowClassName} onClick={() => setAsking(true)}>
        <div className="space-y-1">
          <Body className="text-ink">Eliminar mi cuenta</Body>
          <Caption>Borra tu cuenta y todo lo que has escrito.</Caption>
        </div>
      </button>
    );
  }

  return (
    <div className={rowClassName}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Body className="text-ink">Eliminar mi cuenta</Body>

          {/* The strongest ink in the palette, and no softening. */}
          <Caption className="text-ink-strong">
            Esto borra tu cuenta, todo lo que has escrito, tus prácticas, tus áreas, tu
            dirección personal y tu foto. No se puede deshacer y no hay copia.
          </Caption>

          <Caption>
            Si quieres conservar lo que escribiste, descárgalo antes. Es el último momento
            para hacerlo.
          </Caption>
        </div>

        <Button type="button" variant="secondary" onClick={onExport}>
          Descargar mi archivo
        </Button>

        <div className="space-y-2">
          <Caption>
            Escribe <span className="text-ink-strong">{DELETE_CONFIRMATION}</span> para
            confirmar.
          </Caption>

          <Input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            aria-label={`Escribe ${DELETE_CONFIRMATION} para confirmar`}
            autoComplete="off"
            disabled={deleting}
          />
        </div>

        {error ? (
          <Caption className="text-ink-strong" role="alert">
            {error}
          </Caption>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={!canDelete}
            onClick={handleDelete}
          >
            {deleting ? "Eliminando…" : "Eliminar definitivamente"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={deleting}
            onClick={() => {
              setAsking(false);
              setConfirmation("");
              setError(null);
            }}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MorePage() {
  const { user, profile, changeAccount, signOut } = useAuth();

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

            <LeaveAccountRow
              label="Cambiar de cuenta"
              onLeave={() => void changeAccount()}
            />

            <LeaveAccountRow label="Cerrar sesión" onLeave={() => void signOut()} />

            {user ? <DeleteAccountRow userId={user.id} onExport={handleExport} /> : null}
          </div>
        </div>

        <Link href="/feedback" className={rowClassName}>
          <div className="space-y-1">
            <Body className="text-ink">Ayudar a mejorar Proyecto SER</Body>
            <Caption>Si algo fue confuso o tienes una idea, este es el lugar.</Caption>
          </div>
        </Link>

        <div className="space-y-2 text-center">
          <Caption className="text-ink-faint">
            <Link href="/privacidad" className="underline underline-offset-4 hover:text-ink-soft">
              Aviso de privacidad
            </Link>
            {" · "}
            <Link href="/terminos" className="underline underline-offset-4 hover:text-ink-soft">
              Términos del servicio
            </Link>
          </Caption>

          <Caption className="text-ink-faint">
            Proyecto SER · versión {APP_VERSION}
          </Caption>
        </div>
      </div>
    </Page>
  );
}
