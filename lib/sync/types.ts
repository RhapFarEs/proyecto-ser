/**
 * The shape every domain must satisfy to plug into `createSyncedStore`.
 * `deletedAt` is a tombstone, not a hard delete: a merge can only tell
 * "this item was removed" from "this device never received it yet" if
 * removal leaves a timestamped marker behind, so `remove()` always writes
 * one instead of dropping the record.
 */
export interface SyncableEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Taking a removal back.
 *
 * Because `remove()` writes a tombstone rather than dropping the record,
 * undo is the same operation for every domain: clear the marker and the
 * thing is simply there again, with its id, its history and everything that
 * pointed at it intact. One function rather than one per domain — there is
 * nothing domain-specific left to say.
 */
export function applyRestore<T extends SyncableEntity>(entity: T): T {
  return { ...entity, deletedAt: null };
}
