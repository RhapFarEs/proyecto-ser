# SER — Product Manual v1.0

What SER does today. Not what it will do, not what it should do.

Where behaviour is intentionally absent, this document says so. Where
behaviour is deferred, it says that too. Nothing here is a recommendation.

Governing documents, in order of authority: [CONSTITUTION.md](CONSTITUTION.md)
(what SER is), [DECISIONS.md](DECISIONS.md) (how proposals are judged),
[ADR-0001](ADR-0001-unified-entry-domain.md) (why there is no unified `Entry`
store), [BETA_STRATEGY.md](BETA_STRATEGY.md) (how the beta runs). This manual
outranks none of them; it only describes.

---

# 1. Product Overview

## What SER is

A personal, single-user, local-first place to write each day and be handed
your own words back later. Spanish-language, `tú`, mobile-first, installable
as a PWA. Every screen writes to `localStorage` first and reconciles with
Supabase in the background.

## What SER is not

Not a productivity tool, habit tracker, or note system. It has no streaks, no
scores, no percentages, no completion rates, no charts, no "X of Y" counts, no
social features, no AI that reads what you wrote, and no notifications of any
kind.

## Core principles as implemented

| Principle | How it shows up in the code |
|---|---|
| **No metrics** | No number that can fall appears anywhere in the UI |
| **Absence is silence** | A day with nothing recorded is omitted, never rendered as a gap or a miss |
| **Two voices** | Serif (`ser-voice`, Newsreader) for anything a person wrote; sans for anything the app says |
| **Local-first** | Reads never touch the network; writes go to memory → localStorage → Supabase |
| **Quote, never compose** | The app never generates text in the person's voice; it re-displays their own verbatim |
| **Nothing is graded** | No selection mechanism ranks a person's writing by quality |

## Intended experience

Open it, read one line, write a little, close it. Roughly weekly, something
you wrote earlier reappears. On the exact calendar anniversary of something
you wrote, that reappears instead.

---

# 2. User Journey

Five screens are in the navigation: **Hoy** (`/`), **Diario** (`/journal`),
**Prácticas** (`/habits`), **Camino** (`/progress`), **Más** (`/more`). Four more
are routes without nav entries: `/weekly-review`, `/direction`, `/profile`,
`/feedback`.

Navigation is a fixed bottom bar below `md`, and a left sidebar at `md` and
above. Both render from the same `navigation` array, so they cannot drift.

## Login (`LoginScreen`)

**Purpose.** The only way in.
**Actions.** One button: *Continuar con Google*. Supabase OAuth, implicit flow,
redirect back to `window.location.origin`.
**Stored.** Nothing until the session exists.
**Edge cases.** Failure shows *"No pudimos conectar con Google. Inténtalo de
nuevo."* and re-enables the button. While the session and profile resolve, the
app shows `FullScreenLoader` — the product name and *"Un momento…"*, no spinner.
**Not built.** Email/password, magic links, any second provider.

## Onboarding (`OnboardingFlow`)

Shown once per account, while `profile.onboardingCompleted` is false.

Three steps: a welcome paragraph; *"¿Cómo quieres que te llamemos?"* (the only
field, required, non-empty); and *"Un vistazo rápido"* naming Hoy, Diario and
Prácticas. Finishing writes `displayName` and sets `onboardingCompleted`.

**Edge cases.** Cannot be revisited once completed. Does not ask the person to
write anything. Does not mention Camino, Más, or the weekly review.

## Today (`/`)

**Purpose.** The daily surface.
**Modules, in fixed order** (`today.config.ts`, all `enabled: true`):

| Order | Module | Renders when |
|---|---|---|
| 0 | `GreetingModule` — *Buenos días/tardes/noches* + name + long date | Always |
| 1 | `ReflectionModule` — the day's line, in serif | Always |
| 2 | `EchoModule` — something you wrote before | Only when Echo selects one |
| 3 | `DailyInsightsModule` — one sentence about today | Only when the engine returns one |
| 4 | `TodayWeeklyFocusModule` — this week's Life Area | Only when the week has one |
| 5 | `IntentionModule` — the day's intention | Always |
| 6 | `DailyHabitsModule` — today's scheduled practices | Always |
| 7 | `FooterModule` — the motto | Always |

Greeting boundaries: `< 12h` mañana, `< 19h` tardes, otherwise noches.

`FooterModule` shows *"Ser antes que hacer."* until the person has written a
Direction, after which it shows their statement in serif instead. Nobody
configures this.

The intention can also be removed, with a two-step confirm and the same
nine-second undo.

**Stored.** The intention writes to that day's `Day.intention`. Ticking a
practice writes a `HabitEntry` into `Day.entries`.
**Edge cases.** With no practices scheduled, `DailyHabitsModule` shows an
inline empty state linking to `/habits`, and renders nothing at all before
hydration.

## Journal — Diario (`/journal`)

Two tabs, `Escribir` and `Historial`, as toggle buttons with `aria-pressed`.

**Escribir** renders three modules: `JournalWelcomeModule` (a fixed heading),
`JournalPromptModule` (one fixed question, *"¿Qué ocupa más espacio en tu
mente hoy?"*, identical every day), and `JournalNotesModule` — the composer.

The composer holds a free-text mood field, a row of mood suggestions, and a
body field. Both persist as drafts. Below it, today's notes appear
newest-first, each with time, mood, and per-note **Editar** and **Eliminar**.
Saving shows *"Guardado."* for 2,600 ms. Deleting requires a two-step confirm
and then offers **Deshacer** for 9 seconds.

The composer doubles as the editor. Editing a note re-titles the module
*"Estás corrigiendo una nota"*, keeps the note's id and original `createdAt`,
and changes only text, mood and `updatedAt`.

**Historial** lists days that hold notes, newest day first by date written,
30 days at a time with *"Ver días anteriores"*. Each card shows the date, a
3-line clamp of the most recent note, and expands to every note of that day.

Each note in an expanded day carries **Editar** and **Eliminar** of its own,
so a note from any day can be corrected in place or removed with the same
two-step confirm and nine-second undo. History editing is not draft-backed:
leaving mid-edit costs the correction, never the note.

## Camino (`/progress`)

Route is `/progress`; the label everywhere is **Camino**. Icon is footprints.

Top of screen is a search field over the whole archive. While a query is
present, the rest of the screen is replaced by results.

Not searching, it shows four sections: **Dirección personal** (current
statement, link to edit), **Días con presencia** (up to 30 days, newest
first), **Reflexiones semanales** (every week with any reflection text), and
the start date from `profile.startedAt`.

A day appears in *Días con presencia* if it has a note, an intention, or a
sustained practice. Each card shows the date, the intention verbatim in serif
and quotation marks, *"Sostuviste: …"*, and *"Escribiste en tu diario."*

**Edge cases.** Cards are not interactive — there is no way to open a day.
Search results are likewise not interactive.

## Practices — Prácticas (`/habits`)

**Purpose.** Create and tend practices.
**List.** Each card shows title, the weekdays as `Lu · Ma · Mi …` (or *"Todos
los días"* / *"Sin días programados"*), and `· Archivado` when inactive.
Actions per card: **Editar**, **Archivar/Activar**, **Eliminar** (two-step
confirm). Deleting offers **Deshacer** for 9 seconds, rendered above the list.

**Form.** Title (required), purpose (optional), and seven weekday toggles in
a labelled group, each reporting its own state (at least one required). Save
is disabled until both conditions hold and the form says which is missing.

**Stored.** `Habit { id, title, purpose, weekdays[], active, deletedAt,
createdAt, updatedAt }`.

## Weekly Review — Revisión semanal (`/weekly-review`)

Not in the navigation; reached from a link on Diario and a row in Más.

Week navigation (**Semana anterior** / **Semana siguiente**, the latter
disabled on the current week), then three modules:

- `WeeklyContextModule` — *"Escribiste en tu diario: …"* and *"Sostuviste: …"*
  for that week. Renders nothing when there is neither.
- `WeeklyFocusAreaModule` — chips to pick one Life Area, plus *"Sin área
  específica"*. Renders nothing when no active areas exist. An archived
  selection still shows, suffixed *(archivada)*.
- `WeeklyReflectionModule` — three questions: *¿Qué estuvo bien esta semana?*,
  *¿Qué fue difícil o quiero comprender mejor?*, *¿Qué quiero cuidar la próxima
  semana?* All three persist as drafts scoped to that week's id.

**Stored.** `Week { id (the Monday date key), reflection{wentWell, difficult,
nextWeekFocus}, focusLifeAreaId?, … }`.
**Edge cases.** Any week is editable, including past ones. Backward navigation
has no lower bound.

## Direction — Dirección personal (`/direction`)

Two things on one screen.

**`DirectionStatementModule`** answers *"¿Hacia qué tipo de vida quiero
caminar?"*. Saving **appends a revision**; it never overwrites. The module shows
the current statement and its earlier revisions with dates. Saving identical or
empty text appends nothing and the screen does not move.

**`LifeAreaListModule`** manages Life Areas — title, why it matters, active
flag, `inFocus` flag. Actions: Editar, Archivar/Activar, Eliminar (two-step +
9-second undo). Active and archived areas are listed separately.

## Profile — Perfil (`/profile`)

Reads the profile from `AuthContext`; it does not fetch its own copy.

Shows avatar (uploaded, else Google's, else the first letter of the name),
name, email, start date, birthday. **Editar** switches name and birthday to
fields. Tapping the avatar opens a file picker and uploads to Supabase
Storage. Below, read-only: **Hacia dónde caminas** (the Direction statement)
and **Lo que cuidas** (active Life Areas).

**Edge cases.** Both save paths refresh the shared profile so the greeting and
avatar stay in step. If no profile is loaded, the screen shows either
*"Cargando tu perfil..."* or *"Aún no encontramos tu perfil. Vuelve a iniciar
sesión."*

## Settings — Más (`/more`)

There is no settings screen; Más is it.

**Espacios** — links to Revisión semanal and Dirección personal.
**Atmósfera** — the atmosphere chooser (§10).
**Cuenta** — Perfil; *Descargar mi archivo* (export, one press, no
confirmation); *Cambiar de cuenta*; *Cerrar sesión*; *Eliminar mi cuenta*.
The two leaving actions ask for confirmation only when an unsaved draft
exists. Deletion always asks, and asks harder — see §8.
**Footer** — *Proyecto SER · versión {APP_VERSION}*, sourced from
`package.json` at build time.

## Aviso de privacidad (`/privacidad`) and Términos (`/terminos`)

The only two routes outside `AuthGate`, so they are readable before signing
in and after an account is deleted. Both describe the product as implemented,
including what it does not do: no analytics, no end-to-end encryption, a
publicly readable avatar, and deletion with no grace period and no backup.

## Feedback (`/feedback`)

Category chips (Error, and others), a message field that persists as a draft,
and a send button. On success the form is replaced by *"Gracias."* and *Enviar
otro*. On failure the text is deliberately kept in the field.

Writes to the Supabase `feedback` table, which has an insert policy and **no
select policy** — write-only from the client, readable only via the dashboard.
Each submission carries route, device class, OS, browser and app version. It
never carries anything the person wrote elsewhere.

**Edge case.** The screen returns `null` when signed out.

---

# 3. Writing Model

Four kinds of writing, in three stores, with different rules.

| | Intention | Note | Weekly reflection | Direction |
|---|---|---|---|---|
| Lives in | `Day.intention` | `journal_entries` | `Week.reflection` | `direction` |
| One per | day | unlimited per day | week | append-only chain |
| Editable | yes, any day, by replacement | yes, any day | yes, any week | never — a new revision is appended |
| Deletable | yes | yes | by emptying and saving | **no** |
| Undo | 9 s | 9 s | none | not applicable |
| Overwrites | yes | yes | yes | never |
| Stamped with atmosphere | no | no | no | **yes** |

**Intentions.** One per day, plain text on the `Day`. Saved through the
composer in `IntentionModule`, replaced by writing over it, and removed
through a two-step confirm with undo.

**Notes.** Independent records with their own id, `dayKey`, mood and content.
Editing keeps id and `createdAt` so a corrected note stays in place in the
day rather than jumping to the end. Deleting writes a tombstone.

**Weekly reflections.** Three fields on the `Week`, saved together. Saving
replaces whatever was there.

**Direction.** The only append-only writing in the product. Each save creates
a `DirectionRevision { id, statement, supersedes, atmosphere, deletedAt,
createdAt, updatedAt }`, frozen at construction, pointing at its predecessor.
The current statement is the chain head — the revision no other revision
supersedes — resolved by set membership rather than traversal, with a
deterministic tie-break by id. The pre-append-only row keeps the id
`"direction"` and is simply the first revision; no data was migrated.

**Legacy shapes still read but never written:** `Day.journal.{mood, entry,
closing}`, `Day.rituals.checks`, promoted `JournalEntry`/`IntentionEntry`
records inside `Day.entries`, and `ReflectionEntry` (a day's closing
reflection). The closing-reflection feature was removed once it was found to
be unreachable; the stored shape survives so the export can still return
sentences written by older versions. See §11.

---

# 4. Practices

The domain object is `Habit`. User-facing copy calls it both *hábito* and
*práctica*; see §11.

**Creation.** Title, optional purpose, and one or more weekdays. Created
`active: true`.

**Completion.** `DailyHabitsModule` lists every habit that is `active` and
scheduled for today's weekday. Ticking writes a `HabitEntry { habitId,
completed }` into that `Day.entries`. Unticking sets it back. There is no
notion of a missed day and no word for one anywhere in the product.

**Archiving.** `active: false`. The habit stops appearing on Today, remains in
the list marked `· Archivado`, and keeps all history. Reversible.

**Deletion.** Writes a tombstone (`deletedAt`), so the removal reaches other
devices instead of the habit reappearing on the next pull. Completions in past
days are left behind as orphans and are skipped at render time by a
`habitById` lookup that simply misses.

**Undo.** 9 seconds, via `UndoNotice`. Restoring clears `deletedAt` by id, so
every day that points at that habit becomes readable again — the orphaned
completions re-link. Undo is offered above the list, not at the row.

**History.** Only through Camino: a day lists *"Sostuviste: …"* with the titles
of habits completed that day. There is no per-practice history view, no return
count and no resting state.

**Camino's use.** `buildPathDays` builds a `habitById` map once, walks each
day's `entries`, and collects titles for completed habit entries whose habit
still resolves.

---

# 5. Echo

`lib/domain/memory/echo.ts`. The most load-bearing behaviour in the product.

**Sources.** Exactly two, gathered by `gatherEchoSources()`: every day's
intention with non-empty text, and every journal note. Weekly reflections and
Direction revisions are **not** echo sources.

**Eligibility.** A source is a candidate when all hold:
- `text.trim().length >= 12` (`MIN_TEXT_LENGTH`)
- its `dateKey` is strictly before today
- it is at least **14 days old** (`MIN_AGE_DAYS`)

**Anniversaries.** Any candidate falling on the same calendar day and month as
today wins outright, regardless of cadence. When several qualify, the most
recent wins — *hace un año* before *hace cuatro*. Result carries
`kind: "anniversary"` and `yearsAgo`.

**Cadence.** Absent an anniversary, an echo appears only on an *echo day*:
`daysBetween(firstWritten, today) % 7 === 0` (`ECHO_INTERVAL_DAYS`).
`firstWritten` is the earliest `dateKey` across **all** sources, not just
eligible ones, so the anchor cannot drift forward as entries cross the age
floor. Because nothing can be backdated, this anchor never moves once the
person has written anything.

**Selection.** Candidates are put `inStableOrder` (by date, then id) and a
deterministic `pickStable` chooses by today's key. Same day, same archive,
same echo — across reloads and devices. No randomness, no network.

**Presentation.** No card, no border, no surface — text on the page, held by
space, with extra room above and below. Labelled *"Hace un año, un día como
hoy, escribiste esto."* or *"Escribiste esto el {fecha}."*. Text is verbatim
and never truncated.

**What Echo never does.** It never scores, ranks by quality, filters by
substance, weights by age, excludes anything for seeming unimportant, edits,
summarises, or sends anything anywhere. It returns nothing at all on most
days, and that is the intended state.

---

# 6. Search

On Camino, over the whole archive, on-device.

**Indexed.** `collectArchiveEntries(days, notes, weeks)` produces a flat
`ArchiveEntry { dateKey, kind, text, mood? }` list across four kinds:
`intention`, `note`, `reflection`, `weekly`. It reads current fields and the
legacy shapes listed in §3, de-duplicating a promoted record against the flat
field it was copied from by provenance id, so one writing is never returned
twice.

**Excluded.** Direction revisions, practice titles, profile fields, and
feedback.

**Matching.** `buildSearchIndex` precomputes a comparable form per entry —
NFD-normalised, diacritics stripped, lowercased — once per archive change, not
per keystroke. A query is split on whitespace; **every term must appear** as a
substring, so adding a word narrows. Accent- and case-insensitive in both
directions; partial words match, so a half-remembered stem finds it.

**Ordering.** Newest `dateKey` first, tie-broken by text, descending. There is
no relevance ranking, deliberately.

**Limits.** All matches are counted and shown in the heading; the first 50 are
rendered (`MAX_SEARCH_RESULTS`), followed by *"Se muestran los 50 más
recientes. Añade una palabra para acotar."* An empty query returns nothing
rather than everything.

---

# 7. Sync

One engine, `createSyncedStore`, instantiated once per domain.

| Domain | localStorage key | Supabase table |
|---|---|---|
| Days | `ser.days` | `days` |
| Notes | `ser.journal_entries` | `journal_entries` |
| Habits | `ser.habits` | `habits` |
| Life Areas | `ser.life-areas` | `life_areas` |
| Weeks | `ser.weeks` | `weeks` |
| Direction | `ser.direction` | `direction` |

Profile and avatars are handled separately (`profiles` table, Supabase
Storage). Feedback is write-only.

**Reads.** Memory only. `getAll()` returns a cached snapshot, invalidated on
any write. Nothing ever waits on the network to read.

**Writes.** Memory and localStorage synchronously, then a best-effort async
upsert. A failed push leaves the entity's id in a small pending set in
localStorage.

**Pull.** On sign-in, after the profile resolves. It first retries every
pending write, then fetches all rows for the user and merges: a remote row
replaces the local one only when `remote.updatedAt > local.updatedAt`.

**Conflicts.** Newest `updatedAt` wins. Whole record, no field merging, no
CRDTs, no prompts.

**Deletes.** Always tombstones (`deletedAt`), never row removal, so a deletion
propagates instead of the record reappearing on the next pull.

**Namespacing.** Every localStorage key is suffixed `::{userId}` once a user is
known. A device's first namespaced user inherits whatever sat under the bare
legacy key, and that key is then deleted, so a second account on the same
device finds nothing to adopt.

**Offline.** Writing works normally. The app shell is cached by a service
worker that only ever touches same-origin GETs — Supabase and Google are
different origins and are never intercepted. Reconnecting fires
`retryAllPendingWrites` via an `online` listener.

**Change notification.** Every write and every merging pull bumps a single
global counter (`lib/sync/data-version.ts`). Screens read through
`useStoredValue`, which re-reads whenever that counter changes. There is no
per-domain subscription.

**Device-local, never synced:** the chosen atmosphere (`ser.atmosphere`) and
all drafts (`ser.draft.*`).

---

# 8. Recovery

**Undo.** `UndoNotice`, 9 seconds, for deleted journal notes (today only),
practices, and Life Areas. Restoring clears the tombstone by id, so everything
pointing at the record becomes valid again. The window lives in memory and does
not survive a reload.

**Drafts.** Seven fixed keys under `ser.draft.*`: journal note, intention,
direction, the three weekly fields, and feedback. Each stores `{ scope, text }`
and is ignored when the scope does not match — so one week's half-written
reflection never appears under another week, and a draft written while editing
a note cannot be saved as a second copy of it. Drafts are removed the moment
the writing is saved properly, and are all cleared on sign-out and account
change. They are never synced and never part of the archive.

**Error boundaries.** `app/error.tsx` and `app/global-error.tsx`. Both lead
with *"Lo que escribiste sigue guardado."* and offer *Intentar de nuevo*. The
error itself is never displayed and never transmitted.

**Storage health.** If localStorage throws (Safari Private Browsing, quota),
`SyncStatusNotice` says so in the strongest ink in the palette, above
everything else, with or without an account.

**Sync visibility.** Unsent writes show *"Guardado en este dispositivo. Se
guardará en tu cuenta cuando vuelva la conexión."* An unreachable account after
sign-in shows a distinct, stronger notice.

**Export.** Más → *Descargar mi archivo*. One press, no confirmation, built
entirely on-device from local storage, so it works offline. Produces Markdown
containing everything the collector reaches (§6) plus Direction revisions and
profile basics.

**Account deletion.** Más → *Eliminar mi cuenta*. The only irreversible
action in the product, and the only one that asks the person to type a word
(`eliminar`) rather than tap twice. The warning names exactly what goes, and
offers the export inside itself, because that is the last moment it is
possible.

It removes, in this order: the avatar file; then everything in Supabase via
`delete_my_account()`, a `security definer` function that deletes the
`auth.users` row — every table declares `on delete cascade` against it, so
the profile, days, notes, practices, areas, weeks, direction and feedback go
with it in one transaction; then every local cache and draft on this device.
The session is closed last.

A failure of the avatar step is not fatal and does not stop the rest. A
failure of the Supabase step stops everything after it, and the person is
told plainly that nothing was deleted.

**What cannot be recovered.** A note or intention from a previous day. A
deleted note after its 9 seconds elapse or the page reloads. An overwritten
intention, weekly reflection, or note (editing keeps no prior version). Any
draft after sign-out.

---

# 9. Trust Model

## Guarantees SER makes today

1. Writing is saved locally before anything else, and never blocks on network.
2. If the device cannot save, the app says so immediately and plainly.
3. Nothing the person wrote is ever transmitted anywhere except their own
   Supabase rows, under RLS scoped to `auth.uid() = user_id`. **Profile
   photos are the exception**: they live in a public storage bucket at
   `<user id>/avatar.jpg`, so anyone holding that id can fetch the image
   without signing in. Writes are still restricted to the owner.
4. No model reads their writing. No analytics currently exist at all.
5. Everything they wrote can be exported in one press, offline, in a format
   readable without SER.
6. Deletions propagate rather than resurrect.
7. Direction is append-only: no save destroys a previous statement.
8. Echo never withholds a memory for seeming unimportant.
9. Feedback is write-only from the client.
10. The atmosphere and drafts never leave the device.

## Guarantees SER does **not** make

1. That a deleted account can be recovered. It cannot, by anyone, including
   us. There is no grace period and no backup copy.
2. That there is a privacy policy or terms. There are none.
3. Any conflict resolution beyond newest-write-wins; simultaneous edits on two
   devices lose one side entirely.
4. Encryption at rest beyond what Supabase provides. Not end-to-end.
5. Any recovery of a note deleted more than 9 seconds ago.
6. Any version history except for Direction.
7. Availability of the account without Google.

---

# 10. Design Language

**Naming.** One concept, one noun in copy. Code identifiers may differ — the
practices route is still `/habits`. *Práctica* for the object, *Ritual del
día* for the daily occasion; *Camino*; *Dirección personal*; *Revisión
semanal*. Ellipsis is always `…`.

**Typography.** Newsreader (serif, `ser-voice`) exclusively for what a person
wrote — notes, intentions quoted back, the echo, the daily line when it is
theirs, the Direction. Geist (sans) for everything the software says. `Display`
for page titles, `Body` for content, `Caption` for labels and status. All copy
Spanish, `tú`, sentence case.

**Atmospheres.** Five: *tinta* (default), *papel*, *piedra*, *alba*, *carbón*.
Each is one `data-atmosphere` attribute on `<html>`; every colour resolves from
CSS variables scoped to it. Beyond colour, five non-colour models vary per
atmosphere: radius, weight, shadow, reading leading, and motion scale. First run
resolves from `prefers-color-scheme` (light → papel, dark → tinta); a stored
choice always wins. Every ink/background pair is verified to WCAG AA, most to
AAA. The mobile browser chrome (`theme-color`) follows the atmosphere, applied
pre-paint by an inline script and again whenever the resolved atmosphere
changes.

**Spacing.** `Page` owns vertical rhythm (`space-y-6 sm:space-y-8`). Modules do
not set their own outer margins.

**Cards.** `Card` for grouped content on a raised surface, using `ser-card` so
its radius ages with the atmosphere.

**Buttons.** `primary` (inverted ink/ground) for the action that commits;
`secondary` for confirming a destructive step; `ghost` for everything else.
All are pill-shaped with a press-scale, a focus-visible ring, and disabled
states, and all are at least 44px tall — the documented minimum touch target
on both mobile platforms.

**Loading.** `FullScreenLoader` — product name plus one calm line, no spinner,
`role="status"`. Inline loading lines are announced the same way.

**Saving.** `SavedNotice`: *"Guardado."*, announced politely, arriving with
the settle motion and withdrawing after 2,600 ms. Status never persists.

**Written text.** Anything carrying `ser-voice` renders with
`white-space: pre-wrap`, so the paragraphs a person typed survive. The body
sets `overflow-wrap: break-word` so a pasted link cannot break the layout.

**Empty states.** `EmptyState` with title, description and an optional single
action.

**Undo.** `UndoNotice`: a past-tense line and a **Deshacer** button, `role=
"status" aria-live="polite"`, expiring after 9 seconds, keyed to what was
removed so a second removal restarts the window.

**Confirmations.** Two-step, never a modal: a question in `Caption`, a
`secondary` confirm, a `ghost` cancel. `ConfirmButton` holds this for practices
and areas; the journal has its own equivalent inline.

**Accessibility.** Every field has an accessible name. Toggles expose state
(`aria-pressed`, `aria-checked`). The practice checklist uses
`role="checkbox"`. Status regions are `role="status" aria-live="polite"`.
`prefers-contrast: more` and `prefers-reduced-motion` are both honoured.

**Animations.** `ser-settle-in` (420 ms) for things that arrive politely;
`ser-breathe-in` (700 ms) for the day's line. Both scale with the atmosphere's
motion model and collapse to near-zero under reduced motion.

---

# 11. Known Limitations

Current facts, not plans.

**Writing**
1. Editing a note, an intention or a weekly reflection keeps no prior version.
   Only Direction is append-only.
2. A Direction statement cannot be deleted, only superseded.

**Account and legal**
3. Google is the only sign-in method.
4. Profile photos sit in a public storage bucket at a path derived from the
   user id, so they are readable by anyone holding that id, indefinitely.

**Content**
5. The daily line is drawn from 42 product-written lines plus the person's own
   eligible sentences, indexed by `(year + dayOfYear) % pool.length` — so with
   a small pool it cycles in the same order roughly every six weeks.
6. Own sentences become eligible for that pool at 14 days old and between 30
   and 190 characters.
7. `JournalPromptModule` asks one fixed question, unchanged every day.
8. The insight engine has seven possible messages, chosen deterministically
    from the day's state.

**Interface**
9. Nothing in the app manages focus; opening a form or an edit mode never
    focuses its field.
10. Camino cards and search results are not interactive; there is no way to
    open a specific day.
11. Every route shares the title *Proyecto SER*.
12. The undo window lives in memory and does not survive a reload.
13. Today's empty practices state is the only one not built on `EmptyState`.
14. `<Body>` defaults to `text-ink-soft` and is overridden in most usages.
15. `Section`'s own margin is overridden wherever it is not the first child.

**Scope**
18. Spanish only.
19. `ReflectionEntry` and the legacy closing-reflection fields are read by the
    export and by nothing else; no path writes them.
20. Migrations are applied by hand with `npx supabase db push`.
21. `profile.timezone` is captured at creation and never read.

# 12. Beta State

## Ready

Local-first sync with tombstones, offline queue, retry on reconnect and
visible failure states. Export. Echo, including anniversaries and per-person
cadence. Plain-text search across the whole archive with a prepared index.
Journal composing, editing and deleting any note from any day, with undo.
Practices with
create, edit, archive, delete and undo. Life Areas with the same. Append-only
Direction with history. Weekly review across any week. Complete account
deletion. Five verified
atmospheres with non-colour models. Error boundaries. Privacy notice and
terms, readable without an account. Draft persistence across
seven surfaces. 217 passing tests over pure domain logic; `typecheck`, `eslint`
and `build` clean.

## Intentionally postponed

A unified `Entry` store (ADR-0001 — the archive collector serves the read side
instead). Threads, question-based retrieval, return modes, the printed year,
practice retrospectives. The practices redesign. One writing surface.
Notifications of any kind. End-to-end encryption. Backdating. Migration
automation. Promoting Revisión semanal into the navigation.

## Still blocking beta invitations

1. **The account-deletion migration must be applied** —
   `20260806120000_account_deletion.sql`, via `npx supabase db push`. Until
   it runs, *Eliminar mi cuenta* will fail and say so.
2. **Sign-in verified on a real iPhone and a real Android.** Standalone PWAs
   and Google OAuth interact badly on some platforms and this has not been
   tested on hardware.

Everything else in §11 is a known limitation the beta ships with.
