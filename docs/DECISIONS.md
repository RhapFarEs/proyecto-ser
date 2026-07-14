# DECISIONS

> Record of the important product, design, and architecture decisions for Proyecto SER.
>
> Each decision should answer three questions:
>
> - What did we decide?
> - Why did we decide it?
> - What impact will it have on the project?

---

# 2026-06-29

## D-001 · Birth of Proyecto SER

### Decision

The project officially adopts the name **Proyecto SER**.

SER means:

- Feelings
- Spirituality
- Reconnected

### Reason

The project moved beyond being a productivity app and became a system for supporting personal growth.

The name had to represent a transformation, not a tool.

### Impact

All visual identity, philosophy, and user experience will revolve around the concept of "be before doing".

---

## D-002 · Product philosophy

### Decision

The guiding principle of the project will be:

> **Be before doing.**

Official slogan:

> **One day at a time. A life with purpose.**

### Reason

Actions, habits, and results are a consequence of identity.

Proyecto SER will first help the user remember who they want to become before showing them what they need to do.

### Impact

All future features will need to reinforce this principle.

---

## D-003 · Main screen

### Decision

The main screen of the product will be called **Today**.

Internally it may still be called Dashboard during development.

### Reason

The word "Dashboard" describes an interface.

The word "Today" describes a way of living.

### Impact

Navigation and the user experience will be centered on the present.

---

## D-004 · Design philosophy

### Decision

Proyecto SER will adopt a minimalist design inspired by Apple, Linear, and Raycast.

Principles:

- Plenty of whitespace.
- Typography as the main element.
- Remove unnecessary elements.
- Prioritize calm over the amount of information.

### Reason

The application should feel like a space for reflection, not a control panel.

### Impact

Each design decision should answer the question:

> Does this convey peace?

---

## D-005 · Component architecture

### Decision

Reusable components will live in:

components/ui

Module-specific components will live inside the folder of that module.

### Reason

Separating shared logic from module-specific logic improves scalability and maintainability.

### Impact

All future modules will follow the same structure.

---

## D-006 · Design System

### Decision

Any repeated style used three or more times should become a reusable component.

Examples:

- Container
- Section
- SectionTitle

### Reason

Avoid code duplication and maintain a single source of truth for design.

### Impact

Project maintenance will be simpler and more consistent.

---

## D-007 · Development philosophy

### Decision

Commits will only be made when a complete feature is finished.

Small changes will not be committed individually.

### Reason

The Git history should tell the story of the product, not a sequence of meaningless modifications.

### Impact

Each commit will represent a milestone of the project.

---

## D-008 · Day context

### Decision

The **Today** screen will show two temporal references:

- The calendar date.
- Progress within the personal process (week and day).

### Reason

The date answers what day it is.

Progress answers where the user is on their path.

Proyecto SER must remember both.

### Impact

The user will always have context for their personal progress before beginning their activities.

---

## D-009 · Life comes from content, not effects

### Decision

Proyecto SER will use animations and visual effects only to reinforce the user experience.

The feeling of "life" should come mainly from dynamic content and the user’s personal progress.

### Reason

Visual effects provide only momentary impact.

Meaningful content creates long-term connection.

Proyecto SER seeks to convey calm, purpose, and progress through the app’s daily evolution.

### Impact

The application will feel alive thanks to elements such as:

- Dynamic greeting.
- Dynamic date.
- Day and week of the process.
- Daily reflection.
- Daily intention.
- Activities for the day.

Animations will be subtle and only accompany the experience, never become the center of attention.

---

## D-010 · Proyecto SER is built on rituals

### Decision

Proyecto SER will use the concept of **Ritual** to group activities around a shared intention.

### Reason

A routine describes repetition.

A ritual describes intention.

The goal of the project is not only to help the user complete tasks, but to accompany them in practices with meaning.

### Impact

In the future there will be rituals such as:

- Morning Ritual.
- Evening Ritual.
- Reading Ritual.
- Gratitude Ritual.
- Sunday Ritual.

Each ritual can contain several activities and will have a specific purpose in personal growth.

---

## D-011 · One source of truth per screen

### Decision

Each screen will be responsible for obtaining the information it needs from the domain.

Interface components will not directly consult business logic; they will receive data through `props`.

### Reason

Separating data retrieval from presentation keeps the architecture cleaner, more reusable, and more scalable.

The screen knows the full context of the day; components only represent part of that context.

### Impact

The data flow will always follow the same pattern:

Page → Day Engine → Components

This will prevent duplicate calls to business logic and make future integrations with databases, APIs, and artificial intelligence easier.

---

## D-012 · Components reflect the domain

### Decision

The main components will use names that represent concepts from the Proyecto SER domain rather than generic interface terms.

### Reason

The code names should speak the same language as the product.

This makes the project easier to understand and maintains consistency between documentation, the domain, and implementation.

### Impact

The following names are adopted:

- QuoteSection → ReflectionSection
- GoalSection → IntentionSection
- TodaySection → RitualSection

Component names should represent domain concepts whenever possible.

---

## DEC-006 · Floating bottom navigation

Status: Approved

La navegación principal en dispositivos móviles utilizará un contenedor flotante centrado en la parte inferior de la pantalla.

Motivos:

- Refuerza una identidad visual propia.
- Mejora la percepción de ligereza.
- Mantiene la atención en el contenido.
- Diferencia a Proyecto SER de interfaces convencionales.

La navegación utilizará iconografía minimalista y un botón central destinado a acciones rápidas, no a una pantalla específica.

---

