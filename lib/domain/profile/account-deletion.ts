import { supabase } from "@/lib/supabase/client";
import { clearAllLocalData } from "@/lib/sync/createSyncedStore";
import { clearDrafts } from "@/lib/hooks/useDraft";
import { AVATAR_BUCKET, avatarPath } from "./avatar";

/**
 * What can go wrong, in the words the person will read.
 *
 * Deliberately no error codes and no stack: the only thing that matters to
 * someone who just asked to be deleted is whether it happened, and if not,
 * whether their writing is still there.
 */
export class AccountDeletionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountDeletionError";
  }
}

/**
 * Removes an account and everything in it, everywhere.
 *
 * Three places hold something, and they are removed in an order chosen so
 * that a failure never leaves the account gone but the data behind:
 *
 * 1. **The avatar file.** The only thing not covered by the database
 *    cascade. Attempted first, and deliberately not fatal — a leftover
 *    image must not be the reason someone cannot leave, and the definer
 *    function clears its row regardless.
 * 2. **Supabase.** One `delete_my_account()` call. Every table declares
 *    `on delete cascade` against `auth.users`, so the auth row going takes
 *    the profile, days, notes, practices, areas, weeks, direction and
 *    feedback with it, in one transaction. If this fails, nothing below
 *    runs and the person still has their account and every word in it.
 * 3. **This device.** The local caches and any drafts. Without this the
 *    writing would still be sitting in this browser after they asked for
 *    all of it to go.
 *
 * The session is closed last, and its failure is ignored: by then the
 * account it referred to does not exist.
 */
export async function deleteAccount(userId: string): Promise<void> {
  /*
    `remove()` reports failures by returning them, not by throwing, so the
    `catch` below never saw an RLS rejection or a missing policy — and the
    returned value was discarded. The result: this step could fail on every
    single attempt and say nothing, anywhere, forever.

    Still best effort. Nothing here stops the deletion: a photo left behind
    must never be the reason someone cannot leave.
  */
  try {
    const { error: avatarError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([avatarPath(userId)]);

    if (avatarError) {
      console.error(
        "Account deletion: avatar removal failed, continuing anyway.",
        avatarError,
      );
    }
  } catch (cause: unknown) {
    console.error("Account deletion: avatar removal threw, continuing anyway.", cause);
  }

  const { error } = await supabase.rpc("delete_my_account");

  if (error) {
    /*
      The whole error, not a boolean.

      This line used to read `error` only as a condition and throw it away,
      so the first time deletion failed there was a message on screen and no
      way to find out why — the cause had to be read off a network tab. A
      PostgREST error carries no part of what anyone wrote, so logging it in
      full costs nothing and answers the question immediately.
    */
    console.error("Account deletion failed at delete_my_account().", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    throw new AccountDeletionError(
      "No pudimos eliminar tu cuenta. No se ha borrado nada; todo lo que escribiste sigue aquí.",
    );
  }

  clearAllLocalData();
  clearDrafts();

  try {
    await supabase.auth.signOut();
  } catch {
    // The account is already gone; the session cannot outlive it.
  }
}
