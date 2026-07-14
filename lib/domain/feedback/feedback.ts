import type { FeedbackContext } from "./feedback-context";

export type FeedbackCategory = "error" | "idea" | "confusing" | "other";

/**
 * Write-only from the app's perspective: nothing here ever reads feedback
 * back or updates it (no `resolved` field in this type — that flag exists
 * only for admin triage against the Supabase table directly, the client
 * never touches it).
 */
export interface Feedback {
  id: string;
  userId: string;
  category: FeedbackCategory;
  message: string;
  route: string;
  appVersion: string;
  device: string;
  os: string;
  browser: string;
  createdAt: string;
}

export function createFeedback(
  userId: string,
  category: FeedbackCategory,
  message: string,
  context: FeedbackContext,
): Feedback {
  return {
    id: crypto.randomUUID(),
    userId,
    category,
    message,
    route: context.route,
    appVersion: context.appVersion,
    device: context.device,
    os: context.os,
    browser: context.browser,
    createdAt: new Date().toISOString(),
  };
}
