import { supabase } from "@/lib/supabase/client";
import { AVATAR_BUCKET, avatarPath } from "./avatar";

const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.8;

async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No se pudo procesar la imagen.");
  }

  context.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo procesar la imagen."))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

/**
 * Compresses the image client-side (capped to 512px on the long edge, JPEG
 * quality 0.8) and uploads it to a fixed `<user id>/avatar.jpg` path,
 * overwriting any previous photo. Returns a cache-busted public URL so the
 * new photo shows immediately instead of reusing a cached response for the
 * same path.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const compressed = await compressImage(file);
  const path = avatarPath(userId);

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, compressed, { contentType: "image/jpeg", upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}
