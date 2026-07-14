# SOP Architecture

## Philosophy

The SOP (Personal Operating System) will be developed as a modular, scalable, and easy-to-maintain software product.

Each folder has a specific responsibility, and the code should be organized according to that structure.

---

# Project Structure

app/
Pages and navigation.

components/
Reusable user interface components.

lib/
Reusable functions and business logic.

docs/
Project documentation.

public/
Images, icons, and static assets.

---

# Principles

- One component = one responsibility.
- Avoid duplicating code.
- Prioritize clarity over complexity.
- Design before coding.
- Document important decisions.

---

## Component Hierarchy

Views
↓
Sections
↓
UI Components

- Views represent complete screens.
- Sections represent blocks within a screen.
- UI Components are reusable throughout the application.

---

