# PWA (Progressive Web App)

How Proyecto SER is configured as an installable app on Chrome (Android/desktop), Edge, and Safari (iPhone). See the milestone report in session history for the full rationale; this file is the durable reference.

## Files

- `app/manifest.ts` — generates `/manifest.webmanifest` (Next.js file convention).
- `app/icon.png`, `app/apple-icon.png` — Next.js file-convention icons; auto-injected as `<link rel="icon">` / `<link rel="apple-touch-icon">`.
- `public/icons/` — the manifest's own icon set (`icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `apple-touch-icon-180.png`).
- `public/sw.js` — the service worker (app-shell caching only; see below).
- `components/pwa/ServiceWorkerRegistration.tsx` — registers `sw.js`, production builds only.
- `scripts/generate-pwa-icons.mjs` — regenerates every file in `public/icons/` (plus `app/icon.png`/`app/apple-icon.png`) from an inline SVG source. Run via `npm run generate-pwa-icons`.

## Icons: placeholder status

**Every icon shipped today is a placeholder** — two concentric circles in the app's own zinc-100-on-black palette, not a real logo (no logo asset exists in this project yet). All of the following must be regenerated once real branding exists:

- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/icon-512-maskable.png`
- `public/icons/apple-touch-icon-180.png`
- `app/icon.png`
- `app/apple-icon.png`

To replace them: edit the two SVG strings in `scripts/generate-pwa-icons.mjs` (`standardSvg` for the "any"-purpose icons, `maskableSvg` for the maskable one — keep the maskable version's content within roughly the center 50% of the canvas so it survives circular/squircle OS masks), then run `npm run generate-pwa-icons`. No new sizes need to be added for standard installability; if a design tool exports its own fixed set, just point the manifest/file-convention paths at those instead.

## Manifest choices

| Field | Value | Why |
|---|---|---|
| `name` | Proyecto SER | Full app name, shown on the install prompt. |
| `short_name` | SER | Home-screen label under the icon; kept to what fits without truncation. |
| `description` | Construye una vida con propósito, un día a la vez. | Matches the existing `<meta name="description">`. |
| `start_url` | `/` | The app's actual root/Today route. |
| `display` | `standalone` | No browser chrome — the native-app feel this milestone is about. |
| `orientation` | `portrait-primary` | Mobile-first, single-column app; no landscape layout exists. |
| `background_color` / `theme_color` | `#000000` | Matches `AppLayout`'s `bg-black` and `LoginScreen`'s `bg-black` exactly — there is no separate light theme in this app today (see Theme, below). |

## Theme (light/dark)

The app is **dark-only in practice**. `app/globals.css` still has a leftover `prefers-color-scheme: dark` media query from the original Next.js template, but nothing in the actual UI reads those CSS variables — every real screen hardcodes `bg-black`/`zinc-*` classes. `theme_color`/`background_color` are therefore a single static `#000000`, not a light/dark pair. If a real light mode is ever built, this is the file to revisit.

## Caching strategy

`public/sw.js` caches **same-origin GET requests only** — the HTML shell, JS/CSS chunks, fonts, icons, the manifest. Strategy is stale-while-revalidate: serve the cached response instantly if one exists, while always re-fetching in the background to keep the cache fresh.

Any cross-origin request (Supabase's REST API, Google's auth endpoints, anything not on the app's own origin) is left completely untouched by the `fetch` handler — it returns immediately without calling `respondWith`, so the browser handles it exactly as if the service worker didn't exist. This is a hard, unconditional origin check, not a URL-pattern denylist, so it can't accidentally start matching a Supabase request later.

**Cloud data sync remains exclusively `createSyncedStore`'s job.** The service worker has no awareness of app data at all — it only ever sees requests for static files. Offline data access (previously-synced Days, Habits, Journal notes, etc.) already worked before this milestone, via `createSyncedStore`'s own memory → localStorage cache; this milestone did not change that in any way, only added a way for the app shell itself to open with no network at all.

Registration is gated to `NODE_ENV === "production"` (`ServiceWorkerRegistration.tsx`) — an active service worker fights with `next dev`'s Fast Refresh, serving stale chunks instead of freshly rebuilt ones. It only activates in a real production build.

## Safe areas

`viewport-fit: cover` (set via the `viewport` export in `app/layout.tsx`) is required for `env(safe-area-inset-*)` to ever be non-zero — without it, content never extends under notches/home-indicators and the env() values stay 0 everywhere.

- **Bottom nav** (`BottomNavigation.tsx`): `bottom-4` → `bottom-[calc(1rem+env(safe-area-inset-bottom))]`.
- **Content clearance below the floating nav** (`AppLayout.tsx`'s `<main>`): `pb-28` → `pb-[calc(7rem+env(safe-area-inset-bottom))]`.
- **Top/status bar**: handled without any safe-area CSS at all — `apple-mobile-web-app-status-bar-style` is set to `"black"` (opaque), not `"black-translucent"`, so iOS reserves its own solid status bar instead of letting page content draw underneath it. This was a deliberate choice to avoid retrofitting safe-area-top padding into every view; if the app ever wants a true edge-to-edge look, switching to `"black-translucent"` would require that follow-up work.
- Every other screen renders through the same `AppLayout`/`Page`/`Container` chain, so no other component needed its own safe-area handling. `BottomNavigation` was the only `position: fixed` element in the app (confirmed by search) — there are no other floating elements to account for.

## Remaining limitations before an App Store / Play Store release

- **Icons are placeholders**, not final branding (see above).
- **No custom splash-screen images.** iOS auto-generates a launch screen from the manifest's `background_color` + icon, which is what's configured here — no per-device-size `apple-touch-startup-image` set was generated, since that's a large, exacting image matrix better done once real branding exists.
- **A true native store submission (App Store/Play Store) needs a wrapper**, not just a PWA manifest — e.g. via a Trusted Web Activity (Android) or a tool like PWABuilder (iOS/Android). Nothing in this milestone builds that packaging.
- **The service worker is intentionally minimal.** It doesn't do precise cache versioning beyond one `CACHE_NAME` bump, background sync, or push notifications — none of that was in scope here, and none of it is needed for "the app opens offline."
