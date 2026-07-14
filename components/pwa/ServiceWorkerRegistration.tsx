"use client";

import { useEffect } from "react";

/**
 * Registers the app-shell service worker (`public/sw.js`). Skipped
 * outside production: an active service worker caching JS chunks fights
 * with `next dev`'s Fast Refresh, serving stale modules instead of
 * freshly rebuilt ones. Renders nothing — this only runs a side effect.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.error("Service worker registration failed:", error);
    });
  }, []);

  return null;
}
