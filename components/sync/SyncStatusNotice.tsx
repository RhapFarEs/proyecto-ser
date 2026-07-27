"use client";

import { useEffect, useState } from "react";

import { Caption } from "@/components/ui/Typography";
import { getPendingWriteCount, subscribeToSyncState } from "@/lib/sync/createSyncedStore";
import { useAuth } from "@/lib/auth/AuthContext";

/**
 * Tells the person, quietly, when something they wrote is still only on
 * this device. Deliberately reassuring rather than alarming: their work is
 * already saved locally, so this is a status, not a warning — no red, no
 * icon, no count, no "pendiente" (LANGUAGE_GUIDE forbids debt-framing
 * language). It renders nothing at all in the normal case, which is most
 * of the time.
 *
 * This exists because sync failures used to be completely invisible: a
 * write that couldn't reach Supabase was queued in localStorage and only
 * retried at the next sign-in, with nothing on screen either way.
 */
export default function SyncStatusNotice() {
  const { user } = useAuth();
  const [pending, setPending] = useState(0);

  // Display only. Retrying is handled where it belongs: `pull()` drains the
  // queue during sign-in bootstrap, and the `online` listener in
  // createSyncedStore drains it on reconnect.
  useEffect(() => {
    const sync = () => setPending(getPendingWriteCount());

    sync();
    return subscribeToSyncState(sync);
  }, [user]);

  if (!user || pending === 0) {
    return null;
  }

  return (
    <div className="px-6 pb-2 pt-1 sm:px-8">
      <Caption className="text-stone-600">
        Guardado en este dispositivo. Se guardará en tu cuenta cuando vuelva la conexión.
      </Caption>
    </div>
  );
}
