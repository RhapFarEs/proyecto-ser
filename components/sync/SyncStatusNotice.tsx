"use client";

import { useEffect, useState } from "react";

import { Caption } from "@/components/ui/Typography";
import { getPendingWriteCount, subscribeToSyncState } from "@/lib/sync/createSyncedStore";
import { isStorageWritable, subscribeToStorageHealth } from "@/lib/storage/storage";
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
  const [canSave, setCanSave] = useState(true);

  // Display only. Retrying is handled where it belongs: `pull()` drains the
  // queue during sign-in bootstrap, and the `online` listener in
  // createSyncedStore drains it on reconnect.
  useEffect(() => {
    const sync = () => setPending(getPendingWriteCount());

    sync();
    return subscribeToSyncState(sync);
  }, [user]);

  useEffect(() => {
    const sync = () => setCanSave(isStorageWritable());

    sync();
    return subscribeToStorageHealth(sync);
  }, []);

  /*
    A device that is not saving comes first, and is said plainly.

    The other notice is reassurance — the writing is safe here and will
    travel later. This one is the opposite: the writing is not safe
    anywhere, and the person is the only one who can act on that. It is
    shown without an account, because a device that cannot save is a
    problem before anyone signs in, and it is shown in the strongest ink in
    the palette rather than quietly, because the Constitution forbids
    softening something true to make it comfortable.
  */
  if (!canSave) {
    return (
      <div className="px-6 pb-2 pt-1 sm:px-8">
        <Caption className="text-ink-strong">
          Este dispositivo no está guardando lo que escribes. Copia lo último antes de cerrar
          esta pestaña.
        </Caption>
      </div>
    );
  }

  if (!user || pending === 0) {
    return null;
  }

  return (
    <div className="px-6 pb-2 pt-1 sm:px-8">
      <Caption className="text-ink-faint">
        Guardado en este dispositivo. Se guardará en tu cuenta cuando vuelva la conexión.
      </Caption>
    </div>
  );
}
