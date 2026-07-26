# CHANGELOG

All major improvements to Proyecto SER will be recorded here.

The purpose of this document is to answer one question:

> How did the project evolve?

---

# v0.1 — Foundation

**Date:** 2026-06-29

## Goal

Create the technical and philosophical foundation of the project.

## Added

- Initial setup with Next.js.
- Tailwind CSS integration.
- Initial project architecture.
- Component organization.
- `ui` folder for reusable components.
- `dashboard` folder for the main screen.
- Dynamic greeting system.
- Initial components:
  - GreetingSection
  - QuoteSection
  - TodaySection
  - GoalSection
  - Container
  - Section
  - SectionTitle

## Documentation

The base documents were created:

- PROJECT.md
- ROADMAP.md
- ARCHITECTURE.md
- DESIGN_SYSTEM.md
- DECISIONS.md
- CHANGELOG.md

## Product

The project identity was officially defined.

Name:

**Proyecto SER**

(Feelings and Spirituality Reconnected)

Tagline:

> Be before doing.
>
> One day at a time.
>
> A life with purpose.

---

# Next version

## v0.2 — Today

Goal:

Build the first complete experience for the main screen.

Pending.

---

## v0.1.0 — "Today" Screen v1

### Added

- Day engine (`getToday`).
- Domain models (`Today`, `Day`, `Ritual`, `Activity`).
- Reusable components (`Section`, `Card`, `ChecklistItem`).
- Fully dynamic "Today" screen.

### Improved

- Visual hierarchy.
- Spacing.
- Component organization.

---

## v0.2.0 — Start of Sprint 6

### Added

- `USER_FLOW.md` document.
- Definition of the main navigation flow of Proyecto SER.
- Initial screen architecture.
- Navigation philosophy centered on the "Today" screen.
- The official navigation specification for Proyecto SER was added (`NAVIGATION.md`).

### Decisions

- The "Today" screen will be the entry point of the application.
- Navigation will be designed and documented before implementing any functionality.

---

### Infrastructure

- The global application layout was implemented.
- The base navigation components were added.
- The application was prepared to support mobile and desktop navigation.

---

### Dependencies

- `lucide-react` was added as the official iconography library for the project.

---

### Navigation

- The first version of the Bottom Navigation was implemented.
- The `components/navigation` module was created.
- NavigationItem, navigation.ts, and types.ts were added.

---

### Architecture

- The `components/views` layer was introduced.
- The first View (`TodayView`) was implemented.
- `app/page.tsx` was simplified by delegating the screen composition to the corresponding View.

---


# v1.0 — Production readiness push

**Date:** 2026-07-26

## Goal

Take the project from "promising application" to a product someone could adopt
as part of their daily life.

## Fixed

- **Feedback submission failed for every user.** Root cause was not in the
  client: six migrations (`feedback`, `journal_entries`, `days`, `weeks`,
  `life_areas`, `direction`) had been written and committed but never applied to
  the hosted Supabase project, so `public.feedback` did not exist and PostgREST
  answered `PGRST205`. Applying them fixed feedback *and* restored cloud sync for
  five domains that had been silently failing the same way — Journal, Day, Week,
  Life Area, and Direction were local-only until now.
- Google sign-in in production. The deployed bundle was reading a stale value for
  the Supabase publishable key; renaming the variable to
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` forced the platform to serve the current
  value.
- Journal history no longer waits for a storage re-read to show a note saved
  moments earlier.

## Added

- **Progreso is a real screen.** It was a one-line stub. It now shows personal
  direction, every day where the person was present (an intention, a note, a
  sustained practice, a closing reflection), and all saved weekly reflections —
  with no counts, percentages, or streaks anywhere.
- **Living daily reflections.** The line at the top of Hoy was one hardcoded
  string; it is now a 42-line collection selected deterministically per calendar
  day, written in the product's own voice.
- One more Today insight: an intention set with nothing else done yet is now
  acknowledged instead of met with silence.
- Más now surfaces Revisión semanal and Dirección personal (previously reachable
  only through in-page links) and shows the app version.

## Changed

- **Inclusive language.** The two faith-specific habit suggestions became
  "Orar o meditar" and "Leer algo que te inspire" — the Espíritu category now
  makes sense to someone of any faith and to someone of none, without losing the
  product's spiritual dimension.
- Terminology consistency: the Direction screen is titled "Dirección personal"
  everywhere, matching `VOCABULARY.md`.
- Feedback's failure message now tells the person their text was kept.
- README rewritten from `create-next-app` boilerplate into a real project
  document: the experience, the product invariants that constrain the code, the
  architecture, setup, and the quality gates.

## Removed

- Dead code: the `/journalapp` stub route, the parallel `lib/domain/today` and
  `lib/models/Day` type trees, `lib/day.ts`, `lib/progress.ts`, and the unused
  `getCurrentStreak` / `getWeeklyCompletionRate` computations (both of which
  computed exactly the metrics the product forbids).
