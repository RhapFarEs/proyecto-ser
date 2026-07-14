import { supabase } from "@/lib/supabase/client";
import type { Feedback } from "./feedback";

interface FeedbackRow {
  id: string;
  user_id: string;
  category: string;
  message: string;
  route: string;
  app_version: string;
  device: string;
  os: string;
  browser: string;
  created_at: string;
}

function toRow(feedback: Feedback): FeedbackRow {
  return {
    id: feedback.id,
    user_id: feedback.userId,
    category: feedback.category,
    message: feedback.message,
    route: feedback.route,
    app_version: feedback.appVersion,
    device: feedback.device,
    os: feedback.os,
    browser: feedback.browser,
    created_at: feedback.createdAt,
  };
}

/**
 * Insert-only, matching the domain: nothing in the app ever lists, edits,
 * or deletes feedback — this is the one function this file needs. RLS on
 * `public.feedback` only grants `insert` to the row's own `user_id`; there
 * is deliberately no select policy, so a signed-in user can submit
 * feedback but can't browse anyone's feedback (including their own)
 * through the anon-keyed client. Triage happens from the Supabase
 * dashboard, which uses the service role and bypasses RLS entirely.
 */
export async function submitFeedback(feedback: Feedback): Promise<void> {
  const { error } = await supabase.from("feedback").insert(toRow(feedback));

  if (error) {
    throw error;
  }
}
