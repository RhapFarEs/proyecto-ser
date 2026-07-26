# Proyecto SER

A calm place to return to each day.

Proyecto SER is not a productivity app, a habit tracker, or a journal. It is a
personal operating system for intentional living — a daily companion that helps
someone grow as a human being, without ever measuring, scoring, or pressuring
them.

The full product philosophy lives in [`PRODUCT_VISION.md`](PRODUCT_VISION.md).
Read it before changing any user-facing copy or adding any feature.

## The experience

| Screen | What it is for |
|---|---|
| **Hoy** | The entry point. A reflection, the day's intention, and the practices scheduled for today. |
| **Diario** | Writing with honesty — multiple notes per day, plus the day's closing reflection, and a history of both. |
| **Hábitos** | Practices the person chooses to sustain, scheduled per weekday. Suggestions available, never imposed. |
| **Progreso** | The journey: personal direction, days where the person was present, and saved weekly reflections. |
| **Más** | Weekly review, personal direction, account, and feedback. |

Two deeper spaces sit behind **Más**: **Revisión semanal** (a calm weekly look
back, plus the Life Area to care for next) and **Dirección personal** (where the
person is walking, in their own words).

## Principles that constrain the code

These are not style preferences — they are product invariants. Breaking one is a
bug, even if the code works:

- **No metrics.** No streaks, percentages, completion rates, scores, or
  "X of Y" counts anywhere in the UI. `LANGUAGE_GUIDE.md` lists the forbidden
  vocabulary; the ban applies to concepts, not just words.
- **Absence is silence.** A day with nothing recorded is never rendered as a
  gap, a failure, or a nag. It simply isn't mentioned.
- **All user-facing copy is Spanish**, always `tú`, always sentence case. Code,
  comments, and docs are English.
- **Universally human.** The product supports spirituality, purpose, gratitude,
  and recovery without assuming any specific religion, denomination, or belief
  system.
- **Local-first, then synced.** Every domain writes to `localStorage` first and
  reconciles with Supabase in the background, so the app never blocks on the
  network.

## Architecture

```
app/            Next.js App Router routes — each page delegates to one View
components/
  views/        One per screen; owns data loading and composition
  modules/      Composable blocks a View arranges (Today's are config-driven)
  ui/           Design-system primitives (Button, Card, Typography, ...)
  auth/         AuthGate, OnboardingGate, LoginScreen
lib/
  domain/       One folder per domain: model, storage, migrations
  sync/         createSyncedStore — the shared local-first sync primitive
  auth/         AuthContext (session, profile, bootstrap)
  hooks/        useHydrated / useClientState (SSR-safe browser reads)
supabase/
  migrations/   SQL applied to the hosted project
```

Domains (`day`, `week`, `habit`, `journal`, `life-area`, `direction`, `profile`,
`feedback`, `insights`, `reflections`) never import each other's storage
directly — `AuthContext` is the single place that wires them together on sign-in.

More detail: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md),
[`docs/DOMAIN_MODEL.md`](docs/DOMAIN_MODEL.md).

## Running it

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Two environment variables are required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Both come from the Supabase dashboard under Project Settings → API Keys. The app
throws a clear error at startup if either is missing.

To test from a phone on the same Wi-Fi:

```bash
npm run dev -- --hostname 0.0.0.0
```

Then add that machine's LAN IP to `allowedDevOrigins` in `next.config.ts` and to
the Supabase dashboard's Redirect URLs, or Google sign-in will bounce back to the
Site URL instead.

## Database

Schema changes are SQL files in `supabase/migrations/`, applied with:

```bash
npx supabase db push
```

Every synced table carries a `user_id`, has Row Level Security enabled, and
scopes every policy to `auth.uid() = user_id`. `feedback` is the one exception by
design: it has an insert policy and no select policy, so feedback is write-only
from the client and readable only via the dashboard's service role.

## Quality gates

```bash
npx tsc --noEmit
npx eslint .
npm run build
```

All three must pass clean before a change ships.
