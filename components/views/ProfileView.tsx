"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";

import Page from "@/components/ui/Page";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Body, Caption } from "@/components/ui/Typography";
import { useAuth } from "@/lib/auth/AuthContext";
import { getProfile, updateProfile } from "@/lib/domain/profile/profile-storage";
import { uploadAvatar } from "@/lib/domain/profile/avatar-storage";
import type { Profile } from "@/lib/domain/profile/profile";
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
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"viewing" | "editing">("viewing");
  const [displayName, setDisplayName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [timezone, setTimezone] = useState("");
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
        setTimezone(loaded.timezone);
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
    setTimezone(profile.timezone);
    setSaveError(null);
    setMode("editing");
  };

  const handleSave = () => {
    if (!user) {
      return;
    }

    const trimmedName = displayName.trim();
    const trimmedTimezone = timezone.trim();

    if (!trimmedName) {
      setSaveError("El nombre no puede estar vacío.");
      return;
    }

    if (!trimmedTimezone) {
      setSaveError("La zona horaria no puede estar vacía.");
      return;
    }

    setSaveError(null);
    setSaving(true);

    updateProfile(user.id, (current) => ({
      ...current,
      displayName: trimmedName,
      birthday: birthday.trim() ? birthday.trim() : null,
      timezone: trimmedTimezone,
    }))
      .then((next) => {
        if (!next) {
          setSaveError("No pudimos guardar los cambios. Vuelve a intentarlo.");
          return;
        }

        setProfile(next);
        setDisplayName(next.displayName);
        setBirthday(next.birthday ?? "");
        setTimezone(next.timezone);
        setMode("viewing");
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
    setTimezone(profile.timezone);
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
          <Body className="text-zinc-400">{error}</Body>
        </Card>
      </Page>
    );
  }

  if (!profile) {
    return (
      <Page title="Perfil" subtitle="Lo esencial sobre ti, en un solo lugar.">
        <Card>
          <Body className="text-zinc-400">Cargando tu perfil...</Body>
        </Card>
      </Page>
    );
  }

  const avatarUrl =
    profile.avatarUrl ?? getMetadataString(user.user_metadata, "avatar_url", "picture");
  const initial = profile.displayName.trim().charAt(0).toUpperCase();

  return (
    <Page title="Perfil" subtitle="Lo esencial sobre ti, en un solo lugar.">
      <Card className="space-y-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <button
            type="button"
            onClick={handlePhotoClick}
            disabled={uploadingPhoto}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-zinc-800/80 bg-zinc-900/70 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400/40 disabled:cursor-not-allowed"
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
              <span className="flex h-full w-full items-center justify-center text-xl text-zinc-400">
                {initial || "?"}
              </span>
            )}

            {uploadingPhoto ? (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-zinc-200">
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
              <Body className="text-lg text-zinc-100">{profile.displayName}</Body>
            )}

            <Caption>{user.email}</Caption>
            <Caption>
              Comenzaste este camino el {formatDateKeyLongLabel(profile.startedAt)}.
            </Caption>
          </div>
        </div>

        {photoError ? <Body className="text-zinc-400">{photoError}</Body> : null}

        <div className="space-y-2">
          <Caption>Cumpleaños</Caption>
          {mode === "editing" ? (
            <Input
              type="date"
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
            />
          ) : (
            <Body className="text-zinc-100">
              {profile.birthday ? formatDateKeyLabel(profile.birthday) : "No indicado"}
            </Body>
          )}
        </div>

        <div className="space-y-2">
          <Caption>Zona horaria</Caption>
          {mode === "editing" ? (
            <Input
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              placeholder="America/Mexico_City"
            />
          ) : (
            <Body className="text-zinc-100">{profile.timezone}</Body>
          )}
        </div>

        {saveError ? <Body className="text-zinc-400">{saveError}</Body> : null}

        <div className="flex gap-2 pt-2">
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
    </Page>
  );
}
