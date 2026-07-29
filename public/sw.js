// Proyecto SER service worker — app-shell caching only.
//
// This caches same-origin static assets (the HTML shell, JS/CSS chunks,
// icons, manifest) so the app can still open while offline. It never
// touches cross-origin requests — Supabase's API is always a different
// origin, so it is never intercepted, never cached, and never a second
// source of truth for data. All cloud synchronization continues to be
// handled exclusively by createSyncedStore (memory -> localStorage ->
// Supabase); this service worker has no opinion about app data at all.

// Bumped for the append-only Direction change. A client running the previous
// bundle reads Direction by its old singleton id, so against the new data it
// would show the *oldest* revision as current and, on save, overwrite it.
// Changing this name makes the activate handler drop the stale shell, which
// bounds that window to a single load.
const CACHE_NAME = "ser-shell-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only ever cache GETs, and only same-origin ones. Anything else
  // (POST/PATCH, or any cross-origin request such as Supabase's REST API
  // or Google's auth endpoints) is left completely untouched — the
  // browser handles it natively, exactly as if this service worker did
  // not exist.
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);

      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }

          return response;
        })
        .catch(() => cached);

      // Stale-while-revalidate: serve the cached shell instantly if we
      // have one (so opening the app never waits on the network), while
      // always refreshing the cache in the background for next time.
      return cached || networkFetch;
    }),
  );
});
