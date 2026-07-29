# Transformation Roadmap

How the product that exists today becomes the product described in
[CONSTITUTION.md](CONSTITUTION.md), governed by [DECISIONS.md](DECISIONS.md).

This is a migration plan, not a feature plan. Nothing here is proposed because
it would be nice to have. Every item either resolves a contradiction with the
Constitution, removes weight, or builds something that compounds.

**Assumed capacity: one to two people, part-time, over 12–18 months.** The
sequencing matters more than the estimates. If less gets done than planned, doing
Phases 0–2 well is a complete and coherent outcome; doing all four badly is not.

---

## What was cut from earlier recommendations

Recorded so the same ideas don't return without argument.

| Killed | Why |
|---|---|
| **Remove Habits entirely** | Wrong. Superseded by practice redefinition — the problem was never that practice exists, it was that it behaved like tracking. Retired permanently. |
| **Camino as the home screen** | Right at year five, wrong at year one — it would make an empty archive the first thing a new person sees. Promote it in navigation; revisit home when archives are deep. |
| **"Notifications" as a P1** | Re-sequenced, not killed. The Seventh Law says an invitation must be earned by content, so it *cannot* be built before there is content worth sending. It now depends on threads and anniversaries and moves to Phase 3. Building it earlier would force us to schedule, which is the forbidden version. |
| **End-to-end encryption as near-term** | Demoted to research. The Fourth Law is currently satisfied by *not reading*, which is weaker than cryptography but honest. E2EE is expensive, complicates on-device retrieval and recovery, and at current scale would be theatre. Revisit when there are enough people that "trust us" stops being a reasonable ask. |
| **Feedback form removal as P0** | Cosmetic, not a violation. Demoted into the Phase 1 removals. |
| **Mood analytics, charts, dashboards** | Rejected under G2. Recorded as *never*. |

---

## Sequencing principle

**Every phase must leave the product smaller or calmer than it found it.**

Each phase below has an explicit removal alongside its additions. If a phase
ends with more surfaces than it started with, it was done wrong.

---

## The keystone

Before the phases, the single most important technical observation.

Today, what a person writes is scattered across four unrelated stores with four
shapes: intentions live in `day`, notes in `journal`, weekly reflections in
`week`, direction in `direction`.

Almost everything the Constitution asks for — retrieval, threads, anniversaries,
artifacts, atmosphere stamping, export-with-structure, patina — is an operation
over **everything the person has ever written**. With four stores, each of those
features costs four integrations and grows worse with every new writing surface.

**One append-only `Entry` model unlocks all of them at once.**

```
Entry {
  id, userId, createdAt, updatedAt
  context: "intention" | "note" | "weekly" | "direction" | "practice"
  text
  atmosphere        // where they were, per the design principles
  supersedes?       // revision chain — never an overwrite
  mood?, practiceId?, weekKey?, dayKey?
}
```

Two properties do the work:

- **Append-only.** Revising creates a new Entry pointing at the old one. This
  implements the Second Law's corollary once, globally, rather than per-feature.
- **One shape.** Every compounding system reads one table.

**Migration is evolutionary, not a rewrite.** Existing stores dual-write into
`Entry` while continuing to serve their current reads. Views migrate one at a
time. Nothing is deleted until every read is moved. `createSyncedStore` already
provides the sync semantics; this is a new store using it, not a replacement
for it.

**Everything in Phase 3 depends on this. Nothing in Phase 3 should start before
it is done.**

---

## Debt to clear before new systems

The Constitution made domain logic load-bearing — echo selection, reflection
selection, and threshold rules now encode principles, and a silent regression
in them is a philosophical failure, not a bug.

| Debt | Why it blocks | When |
|---|---|---|
| **No test suite** | Echo, reflection selection, thresholds and append-only semantics must be provably correct before anything is built on them | Phase 0 |
| **Manual migrations** | Data loss risk rises sharply the moment `Entry` exists | Phase 0 |
| **`Day` carries legacy `journal`/`rituals` fields** | Must be resolved before unification, or the legacy shape gets carried into `Entry` forever | Phase 1, before keystone |
| **Hardcoded LAN IP in `next.config.ts`** | Trivial, embarrassing | Phase 0 |
| **Manual `APP_VERSION`** | Will silently rot | Phase 0 |
| **Two test rows in production `feedback`** | Someone else's data in a table that claims to be real | Phase 0 |

---

# P0 — Identity fixes

Places where the product **currently contradicts** the Constitution. These come
first because every day they ship is a day the product argues with its own
document.

### P0.1 — Direction stops overwriting

**Why.** Saving a direction statement destroys the previous one. The Second
Law's corollary — *nothing meaningful is ever overwritten* — is violated on
every save, and it destroys the timeline of beliefs that makes the feature
valuable at all.

| | |
|---|---|
| Principle | Second Law (compounding, corollary) |
| Framework | T1 — converts a permanently flat feature into a compounding one |
| Impact | Invisible today, enormous in year five |
| Complexity | Low. Append instead of update; show current, keep history |
| Risk | Very low |
| Depends on | Nothing |
| Success | Editing direction three times produces three retrievable statements with dates; no code path can destroy an earlier one |

**Note on the deletion tension.** Append-only applies to *the product*, never
to *the person*. A person may always delete their own words — that is the
Fourth Law. What is forbidden is the product silently discarding a version they
did not ask to lose. Deliberate deletion by the person stays, tombstones and
all.

### P0.2 — Unlock the first thirty days

**Why.** Echo requires 30 days of history, own-word reflections require 60, and
anniversaries are impossible before a year. The stress test classified this as a
**constitutional defect, not a tuning parameter**: the Seventh Law makes SER
silent by default, so the obligation to have something worth saying falls on the
product. Today the product has nothing to say for a month and the person leaves.

| | |
|---|---|
| Principle | First Law; the silence-versus-nothing-yet contradiction |
| Framework | T5 (day one) |
| Impact | The highest of any item here |
| Complexity | Low — thresholds and selection rules, no new surfaces |
| Risk | Medium: echoing something written four days ago can feel trivial rather than moving |
| Depends on | Test suite (selection logic must be verifiable) |
| Success | A person who writes on day 1 and day 3 receives something of their own back within the first week, and it does not feel cheap |

Concretely: echo floor from 30 days to ~5, own-word reflections from 60 to ~14,
with an age-weighted curve so older material is preferred as soon as it exists.
**Never** fabricate history to fill the gap — that is forgery under the Fifth
Law.

### P0.3 — Export

**Why.** The Fourth Law states words leave whenever the person wants. Today they
cannot leave at all. This is the clearest single violation in the product.

| | |
|---|---|
| Principle | Fourth Law |
| Framework | Not negotiable — direction, not magnitude |
| Impact | Mostly invisible; decisive when it matters |
| Complexity | Low now, higher later — another reason to do it now |
| Risk | None |
| Depends on | Nothing |
| Success | One action produces every word the person has written, in a form readable without SER, in under a minute |

Ships v1 as prose plus metadata. Re-issued after the keystone to include
structure, per *export includes the threads, not only the text*.

**Second justification:** with migrations still partly manual, export is also
the only real defence against data loss. It de-risks everything after it.

### P0.4 — The two-voice violation on Today

**Why.** The day's intention is the person's own words rendered in the interface
voice, while the same sentence appears in serif on Camino. The design principles
make this semantic, not cosmetic.

Low complexity, no risk, no dependencies. Success: every place a person's words
appear, they appear in their voice.

### P0.5 — Remove what prescribes a life

**Why.** The habit suggestions catalogue recommends how to live. Article II:
SER is not an assistant and does not recommend a way to live.

Deleted, not hidden. Success: no screen in SER proposes a practice the person
did not think of.

### P0.6 — Camino stops promising analytics

The `ChartColumn` icon and "Progress" framing promise measurement the product
deliberately refuses, and sets an expectation the Sixth Law forbids meeting.
Rename to **Camino**, replace the icon. Trivial, and it removes a small daily
lie.

---

# P1 — Structural

Reorganization. No new capabilities — the same product, correctly shaped.

### P1.1 — Resolve legacy `Day` fields

Prerequisite for the keystone. Legacy `journal`/`rituals` fields on `Day` must
be migrated or dropped before unification, or their shape becomes permanent.

Complexity medium, risk medium (data migration), blocks P1.2.

### P1.2 — The `Entry` keystone

As described above. **The most important item in this document.**

| | |
|---|---|
| Principle | Second Law (one place to compound); Fourth Law (structured export) |
| Framework | T2 — grows the archive, not the interface. Zero new surfaces |
| Impact | None visible on the day it ships. Everything after depends on it |
| Complexity | High — the largest engineering item here |
| Risk | Medium, mitigated by dual-write and staged read migration |
| Depends on | P0.1 (append-only semantics), P0.3 (export as safety net), P1.1, test suite |
| Success | Every written thing in SER is queryable from one store, revisions are chains, and each entry knows its atmosphere |

### P1.3 — One writing surface

**Why.** A person with something to say must currently choose a container first
— intention, note, weekly reflection, direction — which taxes the exact moment
that should be frictionless. It is also administration by another name (Third
Law).

Collapse to one input. Context is inferred or offered afterwards, never demanded
before.

| | |
|---|---|
| Impact | High and immediately felt |
| Complexity | Medium — mostly UI once `Entry` exists |
| Risk | **The highest-risk item in the roadmap.** It touches the daily habit of existing people, and a bad version makes the product feel less intentional rather than more |
| Depends on | P1.2 |
| Success | A person can open SER and write without making a decision first, and existing rituals still feel distinct |

Prototype thoroughly. This is the one item worth building twice.

### P1.4 — Navigation: five to four

Promote **Camino** to second position. Surface **Revisión semanal** as a real
destination rather than a link inside Más. Dissolve **Life Areas** into
Direction — two abstractions doing one job.

Net: fewer surfaces, and the highest-meaning ritual stops hiding next to *Cerrar
sesión*.

Low complexity, low risk. Success: nothing of value is more than one tap from a
nav item, and the interface is smaller than before.

### P1.5 — Practices, rebuilt

**Why.** Practices currently behave like habit tracking. The Sixth Law and the
practice principles require a different object.

Four changes:

- **Monotonic return counts.** Never reset, never decrease. *Has vuelto a esto
  147 veces desde marzo.*
- **A resting state.** Explicit, unpunished, entered by choice or by absence.
  There is no word for a missed day.
- **Completion with dignity.** Practices end and move into Camino as a chapter,
  carrying everything written while keeping them. They are not deleted.
- **Occasionally asks for a word.** Roughly fortnightly, optional — the thread
  that connects practice to writing rather than to ticking.

| | |
|---|---|
| Impact | High — converts the most generic part of SER into one of the most distinctive |
| Complexity | Medium |
| Risk | Low |
| Depends on | P1.2 for the written-word part |
| Success | No number in practices can decrease; a person returning after four months sees a record of devotion, not a reset |

### P1.6 — Removals

Feedback form (moves to a link). Remaining chart affordances. The word *hábito*
throughout. Any onboarding step that collects something the product does not use.

---

# P2 — Compounding systems

Only after P1. Each is worth more every year it exists.

### P2.1 — Retrieval

**Why.** The Third Law forbids making people file, which obligates SER to
provide finding. Currently it offers neither. A memory product without retrieval
is an archive nobody opens.

**Not a search bar.** SER offers questions built from the person's own material
— *¿Cuándo escribiste sobre esto? ¿Qué te preocupaba en diciembre?* Typing is
the fallback. Results are their sentences, framed as remembering, never
summarized.

| | |
|---|---|
| Principle | Third Law; Fifth Law (quote, never compose) |
| Framework | G1 — on-device only, no exceptions |
| Impact | Very high, and grows with the archive |
| Complexity | Medium. Start with local lexical search; defer anything model-based |
| Risk | Low if it stays lexical; the risk arrives with semantics |
| Depends on | P1.2 |
| Success | A person can find something they half-remember writing three years ago, without having organized anything, without leaving the device |

### P2.2 — Threads

**Why.** The defining object. Structure that emerges from recognition rather
than filing.

**The mechanic:** while writing, SER occasionally surfaces an earlier line
sharing language with the current one and asks *¿Es esto lo mismo?* One tap.
Never a backlog, never required, never a graph.

| | |
|---|---|
| Principle | Third Law; Second Law (the only superlinear system in SER) |
| Framework | Passes all gates only if suggestion runs locally |
| Impact | Defines the category if it works |
| Complexity | High, and mostly a *quality* problem rather than an engineering one |
| Risk | **The highest in this document.** If suggestions feel like a spam filter, the mechanic is worse than nothing |
| Depends on | P1.2, P2.1 |
| Success | Suggestions are accepted far more often than dismissed, and a person can be shown a thread and say *yes, that is a real thing about my life* |

**Prototype against a year of synthetic entries before committing.** If the
recognition loop does not feel like magic, stop — the strategy above it does not
survive a mediocre version.

### P2.3 — Anniversaries and invitations

Only buildable now, because only now is there something worth saying. Content
earns the invitation; the calendar never does. If a week holds nothing, SER is
silent.

Depends on P1.2 and ideally P2.2. Success: over a year, every message sent
contained something the person wrote, and there were weeks with none.

### P2.4 — The printed year

The strongest artifact. Generated on-device from their own words, typeset in the
atmosphere they lived in, produced as an object that leaves the software.

Impact very high; complexity medium; risk low. Depends on P1.2 and atmosphere
stamping. Success: people keep it, and it is the first thing they mention when
they try to explain SER.

### P2.5 — Practice retrospectives

After a year of tending, show what the person wrote during those months. The
moment practice stops being tracking and becomes evidence of change. Depends on
P1.5 and P2.2.

---

# P3 — Deliberately unbuilt

Recorded with the condition that would reopen each. See the Constitution's
appendix.

| | Reopens when |
|---|---|
| **On-device semantic models** | Local capability produces suggestions people recognize as true. Never as a cloud fallback |
| **Voice entries** | Local transcription is good enough that the recording, not the transcript, can be the record |
| **Letters to a future self** | Delivery can be earned by content rather than scheduled |
| **Inheritance** | SER can credibly hold an obligation measured in decades — a legal and structural question, not a technical one. **Do not mention it in the product until then** |
| **End-to-end encryption** | Scale makes "we don't read it" an insufficient answer |
| **The observer test (G5)** | Should be added to DECISIONS.md **now**, not deferred — it is the one gap the stress test found, and it costs nothing to write before there is a proposal that needs it |

---

## Order of implementation

| Phase | Months | Contents | Ends with |
|---|---|---|---|
| **0** | 1–2 | Tests, migrations, version automation, LAN IP, prod cleanup, **Export** | The archive is safe and portable |
| **1** | 2–5 | P0.1–P0.6, P1.1 | Every known contradiction with the Constitution is resolved |
| **2** | 5–10 | P1.2 keystone, P1.3 one surface, P1.4 navigation, P1.5 practices, P1.6 removals | A smaller, calmer product on a foundation that compounds |
| **3** | 10–16 | P2.1 retrieval, P2.2 threads, P2.3 invitations | SER becomes something no competitor is building |
| **4** | 16–18+ | P2.4 artifact, P2.5 retrospectives | The archive produces objects that leave the software |

If capacity runs out, **stop cleanly at the end of Phase 2.** That state is
coherent, honest, and constitutional — a small, quiet, finished product. Phase 3
half-built is worse than Phase 3 unstarted.

---

## How success is measured

Deliberately not by engagement. Optimizing for weekly actives would violate the
Seventh Law and would trigger the metric-substitution anti-pattern the framework
warns about.

**Measured:** capability (can a person do the thing at all), correctness (does
append-only actually hold under every path), surface count (is the interface
smaller than last year), and the annual Constitution audit.

**Watched, never targeted:** whether people who leave come back, and what they
say when they try to describe SER to someone else.

The real test is unmeasurable and worth stating anyway: **in year ten, is the
archive still true, still theirs, and still legible?** Everything above is an
attempt to make that answer yes.
