# Review Experience

This document designs how Proyecto SER lets a user look back — at a day, a week, their journal, their habits. It is a design document, not an implementation plan: nothing here is built by writing it. Two of the four experiences already exist (Weekly Review, Journal History) and are described here as they are, with proposed refinements. Two do not yet exist (Daily Review, Habit History) and are designed here for the first time, within the domain model already documented in `DOMAIN_MAP.md`.

## Philosophy: reflection, not analytics

Analytics answers "how am I doing." Reflection answers "how did I live." Proyecto SER has never built the first question, and this document does not start now. Every screen described below is a **record**, not a **report**:

- A record says *what happened* — as calm, specific, named facts ("Escribiste en tu diario," "Sostuviste: Meditar").
- A report says *how well it happened* — counts, ratios, comparisons, trends.

Nowhere in this document does a screen compute a score, a percentage, a streak, a ranking, or a "performance" label. Where a metric would be the obvious analytics answer (how consistent was I with this habit?), the reflection answer is offered instead (which days did I do this?) — a list of moments, not a measurement of adherence.

## 1. Daily Review — revisiting a previous day

**Status: proposed, not yet built.**

### What it is

A read view of one specific past `Day` — everything that was actually recorded that day, shown the way Today already shows the current day, minus the ability to act on it. Today is for living the day; Daily Review is for remembering it.

### What it shows

Reusing the exact sections Today already has, in the same order, but as calm, static text rather than interactive controls:

- **The date**, formatted the same way Today's date is (`formatDateKeyLabel`), never the raw `YYYY-MM-DD` key.
- **The habits sustained that day** — the same "Ritual del día" list, but each item shown as settled text (not a checkbox) for the ones that were completed. Habits that existed but weren't completed that day are simply absent — there is no "missed" list, no crossed-out item, no red state. Silence, not a red X, is how an unfinished habit is remembered. This mirrors how `DailyHabitsModule` already renders only what's true, never what's false.
- **The intention that day**, shown exactly as `IntentionModule`'s "saved" state already renders a committed intention — quoted plainly, with no annotation about whether the day "matched" it. An intention is something someone held, not a target they hit or missed.
- **The journal notes written that day**, each with its time and its own words for how the person arrived — reusing `JournalNotesModule`'s note-card treatment, in chronological order. This is the same data `JournalHistoryModule` already surfaces; Daily Review is the fuller version of that same day, not a new data source.
- ~~**A closing reflection, if one exists.**~~ Retired. With no entry point anywhere, nothing had been able to write one since M5.5, so every screen branching on it was branching on a state that could not occur. `day-reflection.ts` is deleted; only the stored shape survives, so the export can still return sentences written by older versions.

### How the user gets there

Not through a new calendar picker — a date grid inviting the user to scan for gaps is itself a subtle pressure device (it turns the week into a board to inspect). Instead, Daily Review is reached by **clicking into a day already surfaced elsewhere**: a day card in Journal History, a date mentioned in a Weekly Review's context line ("Escribiste en tu diario: 12 jul, 9 jul."). The entry points already exist; Daily Review is what they should lead to instead of nothing.

### Editability

Read-only. A past day is not reopened for editing — not the intention, not the notes, not which habits are marked complete. This is a deliberate stance: reflection observes, it doesn't revise the record to look better. (Today itself remains fully editable, since "today" is still being lived.)

## 2. Weekly Review — as built, with refinements

**Status: built.** Route `/weekly-review`, `WeeklyReviewView`.

### What it already does

- Navigates Monday–Sunday weeks, current week by default, no navigation into the future.
- Shows a quiet weekly context (`WeeklyContextModule`): which days were written on, and which practices were sustained during the week — each as a plain comma-joined sentence, never a count.
- Lets the user optionally mark one Life Area to care for that week (`WeeklyFocusAreaModule`), resolved live so a rename or archive never breaks a past week's record.
- Holds a three-prompt manual reflection, explicitly saved, explicitly shown as "Guardado" once written.

### Refinement: link the context back to Daily Review

Right now, "Escribiste en tu diario: 12 jul, 9 jul." is inert text. Once Daily Review exists, each date mentioned in the weekly context should be a quiet link into that day's Daily Review — the natural way a week becomes a set of days worth opening, not just a summary to read past. No new UI language is needed for this: the dates are already there, they just don't go anywhere yet.

### What it deliberately does not do

Show a "days completed / days possible" ratio for the week, rank this week against a previous one, or total how many notes were written. The context section is a *description* of the week, not a *tally* of it.

## 3. Journal History — as built

**Status: built.** `JournalHistoryModule`, inside `/journal`'s "Historial" tab.

### What it already does

Since the M5.5 redesign, a journal entry is not one fixed slot per day but a **growing list of notes** — so History is day-centric, not entry-centric: one card per day that has journal notes, collapsed to a preview of the most recent note, expanding to show every note from that day with its own time and its own mood (free text, never restricted to the six suggested moods).

### Its role going forward

Journal History is the most natural front door into Daily Review — a user already scans it looking for "that day I wrote about X." Expanding a card currently shows the notes inline; the proposed evolution is for the expand action (or a quiet "Ver el día" link within it) to open the fuller Daily Review for that date, so the same click that shows "what I wrote" can also show "what else was true that day" without the user needing to remember two different places to look.

## 4. Habit History — how habits should be remembered

**Status: proposed, not yet built.** This is the section most at risk of drifting into analytics, so it gets the most explicit design.

### The temptation, named and rejected

The obvious version of "habit history" is a calendar heatmap or a streak counter — GitHub's contribution graph is the reference point everyone reaches for. Proyecto SER rejects both, not just because they'd display a number, but because the *shape* of a grid of filled/empty cells is itself a scoreboard, even with no digits printed on it. A heatmap makes fifteen empty squares look like fifteen failures, regardless of what words surround it. Habit History needs a different shape entirely, not a de-numbered version of the same shape.

### The design: a list of days, not a grid of cells

For a given Habit, viewed from its own detail (reached from the Habits page, e.g. tapping a habit card), Habit History is a short, plain list of the days it was sustained — reusing the exact sentence pattern already established everywhere else in the product (`"Sostuviste: Meditar, Beber agua."`): **"Lo sostuviste: 10 jul, 8 jul, 5 jul."** No total, no denominator, no "out of the last 14 days." Just the dates, most recent first, each one a link into that day's Daily Review.

Two consequences of this shape, both intentional:

- **There is no visible "gap."** A grid makes absence visually loud (an empty cell sits right next to a filled one, inviting comparison). A list only shows presence — a day that wasn't sustained simply isn't a line in the list, the same way `DailyHabitsModule` never shows an unchecked-and-crossed-out item. This is the same "silence over failure" principle Daily Review uses for the same reason.
- **The list should be bounded to something recent** (a handful of entries, not the habit's entire lifetime), so it reads as "here's what you've been doing lately," not an archive to audit. The exact number is an implementation detail, not a design commitment — the commitment is that it feels like a short, warm memory, not a ledger.

### What replaces "consistency"

If a user wants to know whether they've been keeping up with a habit, the honest reflection-shaped answer is the list itself: read three or four recent dates and you know, without the app telling you what to feel about it. The product doesn't need to compute "you did this 6 of the last 7 days" — the person reading "10 jul, 9 jul, 8 jul, 7 jul, 5 jul" already understands the shape of their own week better than a percentage would explain it to them.

### Editing and archiving

Exactly as already established in the Habit domain (`DOMAIN_MAP.md`): archiving a habit removes it from future scheduling but never touches its historical `HabitEntry` records, and Habit History for an archived habit should keep working — the dates it was sustained don't stop being true because the habit itself is no longer active.

## Previous intentions: how they should be shown

An intention is never shown with a verdict. Wherever a past intention appears — Daily Review, or a future "intentions over time" view if one is ever built — it is quoted, not scored:

> *Tu intención ese día: "Vivir bien el día de hoy."*

No checkmark, no "achieved/not achieved" toggle, no percentage of days an intention was "kept." An intention describes a stance the person chose to hold, not a task with a completion state. This is consistent with the M5.5 redesign, which already treats a saved intention as *committed* rather than *tracked* — Daily Review just extends that same treatment backward in time.

## How Life Areas should appear naturally

Life Areas exist today only as a single optional reference from a Week (`Week.focusLifeAreaId`, per `DOMAIN_MAP.md`). The rest of this section is intentionally aspirational — it describes how the *review* experiences should let a Life Area surface once more of the domain (Habit→LifeArea, a daily intention or note→LifeArea) exists, without prescribing that those links be built now.

The guiding rule: a Life Area should appear as **quiet context, not a category system**. Never a colored tag, never a filter chip, never a badge count ("3 entries this week"). Just a name, in the same plain-prose style already used everywhere:

- **In Daily Review**, if that day's intention or a note is ever linked to an area, it reads as a soft aside beneath the content — *"Relacionado con: Salud."* — not a label pinned to the corner of a card.
- **In Weekly Review**, the existing focus-area selector already does this correctly — a plain sentence naming the area, resolved live so a rename or archive is never a broken reference. The natural extension is for the weekly context summary to mention an area the same way it mentions sustained practices — *"Cuidaste: Salud."* — once habits or notes can actually be attributed to one.
- **In Habit History**, if a Habit ever gains a Life Area reference, its detail view could carry one quiet line — *"Parte de: Descanso."* — beneath the habit's own purpose text, never a separate colored badge.

In every case, a Life Area is resolved by id at render time, exactly as `WeeklyFocusAreaModule` already does — the name displayed is always the area's *current* title, so a rename anywhere propagates everywhere it's referenced, and an archived area still resolves rather than vanishing from history.

## Visual & interaction principles for anyone building this

Distilled from the above, for direct reuse when this is eventually implemented:

**Do**
- Reuse existing primitives exactly as they already read: `Card`, `SectionTitle`, `Body`/`Caption` typography, the comma-joined "X, Y, Z." sentence pattern, `ChecklistItem`'s settled/unsettled visual states.
- Show only what happened. Absence is silence, never a marker.
- Resolve every cross-domain reference (Habit, Life Area) live, by id, at render time — never store a copied name.
- Treat every past record as read-only.

**Don't**
- Compute or display a percentage, ratio, count, streak, or ranking anywhere in a review surface.
- Render a calendar heatmap, contribution grid, or any visualization whose *shape* implies measurement even without printed numbers.
- Show a "missed" or "incomplete" state for a habit, intention, or day.
- Let a Life Area become a tag, filter, or badge system.

## Open questions for the product team

- Should Daily Review ever become *partially* editable (e.g. correcting a typo in a note), or should immutability be absolute? This document assumes absolute, but it's a real product choice, not a technical constraint.
- ~~Should the closing reflection return inside Daily Review as a read surface for historical data only?~~ Answered by deletion: the code that would have backed it was removed once it was found to be unwritable. Reintroducing it would be a new feature, decided as one.
- How many recent dates belong in a Habit History list before it stops feeling like "a short memory" and starts feeling like "a ledger"? This document deliberately doesn't fix a number.
