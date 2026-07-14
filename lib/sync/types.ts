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
