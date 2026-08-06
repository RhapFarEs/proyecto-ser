/**
 * Where a person's photo lives.
 *
 * Pure and free of the Supabase client on purpose: uploading and deleting
 * must address the same object, and that agreement is the one part of the
 * avatar path worth testing without a network in the room.
 */
export const AVATAR_BUCKET = "avatars";

/**
 * One fixed path per person, so a new photo overwrites the previous one
 * rather than accumulating, and so deletion knows exactly what to remove.
 *
 * The first segment is the user id, which is also what the bucket's insert,
 * update and delete policies check — a path shaped any other way would be
 * rejected by them.
 */
export function avatarPath(userId: string): string {
  return `${userId}/avatar.jpg`;
}
