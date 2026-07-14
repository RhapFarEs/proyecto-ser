# Domain Model

Proyecto SER revolves around one central concept:

Entry.

Everything the user does creates an Entry.

---

## Day

Represents one calendar day.

Contains multiple Entries.

---

## Entry

Represents one meaningful interaction.

Fields:

- id
- type
- createdAt
- updatedAt

---

## Entry Types

Journal

Reflection

Habit

Ritual

Intention

Progress

Purpose (future)

---

## Relationships

One Day

↓

Many Entries

Each Entry

↓

One Module

---

## Guiding Principle

The application does not store activities.

It stores meaningful moments.

Every feature should ultimately create or update an Entry.

Avoid modeling features independently when they naturally fit the Entry concept.

Keep the document conceptual.

No database schemas.

No implementation details.

No framework references.