/**
 * Taken from package.json at build time (see `next.config.ts`). Shown on
 * the Más screen and attached to every feedback submission, so incoming
 * feedback can be tied to the version it was written against — which it
 * could not be while this was a hand-bumped constant that had drifted to
 * 1.0.0 against a package version of 0.1.0.
 */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "desconocida";

export interface FeedbackContext {
  route: string;
  device: "mobile" | "desktop";
  os: string;
  browser: string;
  appVersion: string;
}

function detectOS(userAgent: string): string {
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "iOS";
  }

  if (/Android/i.test(userAgent)) {
    return "Android";
  }

  if (/Windows/i.test(userAgent)) {
    return "Windows";
  }

  if (/Mac OS X/i.test(userAgent)) {
    return "macOS";
  }

  if (/Linux/i.test(userAgent)) {
    return "Linux";
  }

  return "Desconocido";
}

// Order matters: Chrome and Safari UAs both contain "Safari/", and Edge's
// contains both "Chrome/" and "Safari/" — most specific token checked first.
function detectBrowser(userAgent: string): string {
  if (/Edg\//i.test(userAgent)) {
    return "Edge";
  }

  if (/Chrome\//i.test(userAgent)) {
    return "Chrome";
  }

  if (/Firefox\//i.test(userAgent)) {
    return "Firefox";
  }

  if (/Safari\//i.test(userAgent)) {
    return "Safari";
  }

  return "Desconocido";
}

function detectDevice(userAgent: string): "mobile" | "desktop" {
  return /Mobi|Android|iPhone|iPad/i.test(userAgent) ? "mobile" : "desktop";
}

/**
 * Pure and framework-agnostic on purpose: the caller supplies `route` (from
 * Next.js's `usePathname()`) and `userAgent` (from `navigator.userAgent`) —
 * this file never touches `window`/`navigator`/routing itself, so it stays
 * trivially testable and has no hidden dependency on running in a browser.
 */
export function captureFeedbackContext(route: string, userAgent: string): FeedbackContext {
  return {
    route,
    device: detectDevice(userAgent),
    os: detectOS(userAgent),
    browser: detectBrowser(userAgent),
    appVersion: APP_VERSION,
  };
}
