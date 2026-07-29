"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";

import Link from "next/link";

import Page from "@/components/ui/Page";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import { Body, Caption } from "@/components/ui/Typography";
import { useAuth } from "@/lib/auth/AuthContext";
import { getProfile, updateProfile } from "@/lib/domain/profile/profile-storage";
import { uploadAvatar } from "@/lib/domain/profile/avatar-storage";
import type { Profile } from "@/lib/domain/profile/profile";
import { getLifeAreas } from "@/lib/domain/life-area/life-area-storage";
import { getLifeDirection } from "@/lib/domain/direction/direction-storage";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { formatDateKeyLabel, formatDateKeyLongLabel } from "@/lib/date";

function getMetadataString(
  metadata: Record<string, unknown> | undefined,
  ...keys: string[]
): string | undefined {
  if (!metadata) {
    return undefined;
  }

  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}

export default function ProfileView() {
  const { user, refreshProfile } = useAuth();
  const hydrated = useHydrated();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"viewing" | "editing">("viewing");
  const [displayName, setDisplayName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    getProfile(user.id)
      .then((loaded) => {
        if (!active) {
          return;
        }

        if (!loaded) {
          setError("Aún no encontramos tu perfil. Vuelve a iniciar sesión.");
          return;
        }

        setProfile(loaded);
        setDisplayName(loaded.displayName);
        setBirthday(loaded.birthday ?? "");
      })
      .catch(() => {
        if (active) {
          setError("No pudimos cargar tu perfil.");
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleEdit = () => {
    if (!profile) {
      return;
    }

    setDisplayName(profile.displayName);
    setBirthday(profile.birthday ?? "");
    setSaveError(null);
    setMode("editing");
  };

  const handleSave = () => {
    if (!user) {
      return;
    }

    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setSaveError("El nombre no puede estar vacío.");
      return;
    }

    setSaveError(null);
    setSaving(true);

    // Timezone isn't part of this form — spreading `current` first keeps
    // whatever value is already stored untouched, it's just never shown or
    // editable here anymore.
    updateProfile(user.id, (current) => ({
      ...current,
      displayName: trimmedName,
      birthday: birthday.trim() ? birthday.trim() : null,
    }))
      .then((next) => {
        if (!next) {
          setSaveError("No pudimos guardar los cambios. Vuelve a intentarlo.");
          return;
        }

        setProfile(next);
        setDisplayName(next.displayName);
        setBirthday(next.birthday ?? "");
        setMode("viewing");

        // Keeps AuthContext's own profile (which Today's greeting reads)
        // from going stale after a save — same pattern OnboardingFlow uses.
        void refreshProfile();
      })
      .catch(() => {
        setSaveError("No pudimos guardar los cambios. Vuelve a intentarlo.");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleCancel = () => {
    if (!profile) {
      return;
    }

    setDisplayName(profile.displayName);
    setBirthday(profile.birthday ?? "");
    setSaveError(null);
    setMode("viewing");
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !user) {
      return;
    }

    setPhotoError(null);
    setUploadingPhoto(true);

    uploadAvatar(user.id, file)
      .then((avatarUrl) => updateProfile(user.id, (current) => ({ ...current, avatarUrl })))
      .then((next) => {
        if (!next) {
          setPhotoError("No pudimos actualizar tu foto. Vuelve a intentarlo.");
          return;
        }

        setProfile(next);
      })
      .catch(() => {
        setPhotoError("No pudimos actualizar tu foto. Vuelve a intentarlo.");
      })
      .finally(() => {
        setUploadingPhoto(false);
      });
  };

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <Page title="Perfil" subtitle="Lo esencial sobre ti, en un solo lugar.">
        <Card>
          <Body className="text-ink-soft">{error}</Body>
        </Card>
      </Page>
    );
  }

  if (!profile) {
    return (
      <Page title="Perfil" subtitle="Lo esencial sobre ti, en un solo lugar.">
        <Card>
          <Body className="text-ink-soft">Cargando tu perfil...</Body>
        </Card>
      </Page>
    );
  }

  const avatarUrl =
    profile.avatarUrl ?? getMetadataString(user.user_metadata, "avatar_url", "picture");
  const initial = profile.displayName.trim().charAt(0).toUpperCase();

  // A profile that only shows a name, an email and a birthday describes an
  // account. What the person actually cares about — the areas they chose to
  // tend, the direction they wrote for themselves — is what makes this page
  // theirs. Read-only here; both are edited where they're created.
  const caredForAreas = hydrated ? getLifeAreas().filter((area) => area.active) : [];
  const directionStatement = hydrated ? (getLifeDirection()?.statement.trim() ?? "") : "";

  return (
    <Page title="Perfil" subtitle="Quién eres aquí, y qué te importa.">
      <Card className="space-y-4">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <button
            type="button"
            onClick={handlePhotoClick}
            disabled={uploadingPhoto}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-line bg-surface-raised outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ink-faint disabled:cursor-not-allowed"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl text-ink-soft">
                {initial || "?"}
              </span>
            )}

            {uploadingPhoto ? (
              <span className="absolute inset-0 flex items-center justify-center bg-surface text-xs text-ink">
                Subiendo...
              </span>
            ) : null}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />

          <div className="space-y-1">
            {mode === "editing" ? (
              <Input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Tu nombre"
              />
            ) : (
              <Body className="text-lg text-ink">{profile.displayName}</Body>
            )}

            <Caption>{user.email}</Caption>
            <Caption className="text-ink-faint">
              Comenzaste este camino el {formatDateKeyLongLabel(profile.startedAt)}.
            </Caption>
          </div>
        </div>

        {photoError ? <Body className="text-ink-soft">{photoError}</Body> : null}

        <div className="space-y-1.5">
          <Caption>Cumpleaños</Caption>
          {mode === "editing" ? (
            <Input
              type="date"
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
            />
          ) : (
            <Body className="text-ink">
              {profile.birthday ? formatDateKeyLabel(profile.birthday) : "No indicado"}
            </Body>
          )}
        </div>

        {saveError ? <Body className="text-ink-soft">{saveError}</Body> : null}

        <div className="flex gap-2">
          {mode === "editing" ? (
            <>
              <Button type="button" variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={saving}>
                Cancelar
              </Button>
            </>
          ) : (
            <Button type="button" variant="secondary" onClick={handleEdit}>
              Editar
            </Button>
          )}
        </div>
      </Card>

      {directionStatement ? (
        <div className="space-y-3">
          <SectionTitle>Hacia dónde caminas</SectionTitle>
          <Card>
            <Body className="ser-voice text-lg leading-[1.65] text-ink">
              {directionStatement}
            </Body>
          </Card>
        </div>
      ) : null}

      {caredForAreas.length > 0 ? (
        <div className="space-y-3">
          <SectionTitle>Lo que cuidas</SectionTitle>
          <Card className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {caredForAreas.map((area) => (
                <span
                  key={area.id}
                  className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-soft"
                >
                  {area.title}
                </span>
              ))}
            </div>

            <Link href="/direction" className="inline-block w-fit">
              <Caption className="underline-offset-4 transition-colors hover:text-ink-soft hover:underline">
                Revisar tus áreas de vida
              </Caption>
            </Link>
          </Card>
        </div>
      ) : null}
    </Page>
  );
}
