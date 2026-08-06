// Proyecto SER service worker — app-shell caching only.
//
// This caches same-origin static assets (the HTML shell, JS/CSS chunks,
// icons, manifest) so the app can still open while offline. It never
// touches cross-origin requests — Supabase's API is always a different
// origin, so it is never intercepted, never cached, and never a second
// source of truth for data. All cloud synchronization continues to be
// handled exclusively by createSyncedStore (memory -> localStorage ->
// Supabase); this service worker has no opinion about app data at all.

// Bumping this drops every previously cached asset on activate.
//
// It is no longer how a new build reaches people — the HTML is fetched from
// the network now, so each load names the current bundles by itself. This is
// only a lever for evicting assets wholesale, which nothing routinely needs.
const CACHE_NAME = "ser-shell-v3";

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

  // A document request — the HTML shell. Everything else here is a build
  // asset whose filename already carries a content hash.
  const isDocument =
    request.mode === "navigate" || request.destination === "document";

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);

      const fromNetwork = fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }

          return response;
        })
        .catch(() => cached);

      /*
        The HTML is fetched first and only falls back to the cache offline.

        It used to be served from the cache immediately, like everything
        else. But the HTML is what names the hashed script bundles, so a
        cached copy pins the whole app to the build it was cached from —
        every person stayed one deploy behind, and a fix shipped on Friday
        did not reach them until their second load. During a beta that
        turns a bug report into a report about a build nobody is running.

        Assets keep the old behaviour, and can: their names change whenever
        their contents do, so a cached one is never stale — it is simply
        the correct file for the HTML that asked for it.
      */
      if (isDocument) {
        return fromNetwork;
      }

      return cached || fromNetwork;
    }),
  );
});
