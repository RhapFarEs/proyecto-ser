import { Caption, Display } from "@/components/ui/Typography";

/**
 * Shown while the session and profile resolve, before the app can decide
 * between the login screen, onboarding, and the app itself. Previously
 * this moment rendered an empty black screen, which on a slow connection
 * reads as a broken page rather than a loading one.
 *
 * Quiet by design: the product's name and one calm line, no spinner. A
 * spinner communicates "you are waiting"; this communicates "you have
 * arrived" (DESIGN_SYSTEM.md: silence is a feature).
 */
export default function FullScreenLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-stone-950 px-6"
      role="status"
      aria-live="polite"
    >
      <div className="space-y-3 text-center">
        <Display>Proyecto SER</Display>
        <Caption>Un momento…</Caption>
      </div>
    </div>
  );
}
