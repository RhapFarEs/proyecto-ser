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

