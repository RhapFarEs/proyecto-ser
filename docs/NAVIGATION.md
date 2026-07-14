# NAVIGATION

Version: 1.0

---

# Objective

Define the navigation structure of Proyecto SER.

This document describes how the user moves through the application.

It does not describe components or implementation.

It describes the experience.

---

# Principles

1. The "Today" screen is the center of the application.

2. Every screen should be reachable in a maximum of two actions.

3. Dead ends should never exist.

4. It should always be clear where the user is.

5. Navigation should feel light and predictable.

---

# Main screens

Today

Journal

Habits

Intentions

Library

Progress

Profile

---

# Hierarchy

Proyecto SER

├── Today
│
├── Journal
│     ├── New entry
│     ├── History
│     ├── Search
│     └── Entry
│
├── Habits
│     ├── List
│     └── Habit
│
├── Intentions
│     ├── List
│     └── Intention
│
├── Library
│     ├── Categories
│     ├── Document
│     └── Search
│
├── Progress
│     ├── Habits
│     ├── Training
│     ├── Journal
│     └── Statistics
│
└── Profile
      ├── Account
      ├── Appearance
      ├── Export
      └── Settings

---

# Mobile navigation

Bottom bar.

🏠 Today

📖 Journal

➕ Create

📈 Progress

👤 Profile

---

# Plus button

The central button will always be available.

It will allow creation of:

- New entry
- New habit
- New intention
- New note
- New training

It will not open a screen.

It will open a quick-actions menu.

---

# Desktop navigation

Permanent sidebar.

Logo

Today

Journal

Habits

Intentions

Library

Progress

Profile

Navigation never disappears.

---

# Back button

Every secondary screen should have a way back.

Primary screens will never show a back button.

---

# Main flow

Open the application

↓

Today

↓

Select an action

↓

Perform the action

↓

Return

↓

Today

---

# Simplicity rule

Each screen should answer only one question.

If a screen tries to solve two different problems, it should be split.

---

# Philosophy

Proyecto SER is not trying to show a lot of information.

It seeks to show only the right information at the right time.