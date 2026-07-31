# ADR-0001 — Does SER require a unified Entry domain?

**Status:** Proposed — overturns `ROADMAP.md` P1.2
**Date:** 2026-07-31
**Supersedes:** the justification for P1.2, not yet the roadmap text

---

## Context

`ROADMAP.md` names a unified `Entry` model as the keystone of the entire
transformation, on this reasoning:

> Almost everything the Constitution asks for — retrieval, threads,
> anniversaries, artifacts, atmosphere stamping, structured export, patina —
> is an operation over **everything the person has ever written**. With four
> stores, each of those features costs four integrations.

That sentence was written before P0.3 existed.

Since then, `collectArchiveEntries` has shipped: a pure, tested function that
produces exactly "everything the person has ever written" from the existing
stores at read time. Export — a feature the roadmap said depended on the
keystone — was built without it.

The four-integrations problem has already been solved once. This ADR asks
whether the keystone is still needed, and tries to falsify it rather than
defend it.

### What exists today

| Domain | Storage | Overwrites? | Stable ids? |
|---|---|---|---|
| Direction | Own store, append-only revisions (Sprint 1) | No | Yes |
| Journal notes | Own store | No (per note) | Yes (UUID) |
| Day — `intention` | Field on a mutable container | **Yes** | No |
| Week — `reflection` | Field on a mutable container | **Yes** | No |

Two domains overwrite. Two do not. That is the whole problem, stated plainly.

---

## Options

**Option A — No Entry.** Apply Sprint 1's frozen revision engine independently
to Day's intention and Week's reflection. Leave Journal Notes and Direction as
they are. Cross-domain references, if ever needed, use `(domain, id)`.

**Option B — Unified Entry.** Every piece of authored writing becomes an
Entry. Existing domains become producers or projections over it.

---

## 1. Philosophical alignment → **A, narrowly**

The Constitution never asks for unification. It asks that nothing meaningful
be overwritten, that structure emerge from recognition rather than
administration, and that the application stay small. **Four domains that each
never overwrite satisfy the Second Law exactly as well as one domain that
never overwrites.**

One principle speaks directly to this, and it cuts against B:

> An intention was a promise about a day; a journal note was a state of mind;
> a superseded statement of direction was a belief. Returned through one voice
> they flatten into "something you wrote".

The named failure mode is **flattening distinct kinds into one thing.** A
unified Entry is literally that flattening; a discriminator preserves the
information but moves the architecture's centre of gravity toward "these are
all the same." Return Modes — the direction we committed to — presuppose the
kinds are genuinely different objects.

The strongest argument for B is that a life is not four filing cabinets, and
that "continuity" implies one continuous record. That is a real intuition, but
it is an argument about how the archive *reads*, and reading is a projection
concern. It does not require the storage to be one thing.

Worth flagging honestly: the "one atom, with revision as a relation over
atoms" framing that made Entry feel inevitable came from a strategy
conversation, **not from the Constitution**. It has no constitutional force.

## 2. Domain complexity → **A, clearly**

**Option A introduces no new concepts.** It applies an existing, frozen,
tested engine to two more domains. Nothing disappears, but nothing is added.

**Option B introduces Entry, kind, subject period, time precision, source
identity, producers, projections, and a dual-write period** — and removes
nothing, because "a day" and "a week" remain product concepts regardless of
where their text lives. B is a layer *above* the existing domains, not a
replacement for them. It is strictly additive for a long time, and possibly
permanently.

Explaining A to a new engineer: *nothing you write is ever overwritten,
anywhere.* One rule, four places.

Explaining B: *everything becomes an Entry, and days and weeks are views over
Entries* — a better product story, and more machinery to hold in your head.

## 3. Long-term evolution → **A, strongly. This is the decisive argument.**

The two options are **not symmetrically reversible**.

- **A → B later is possible.** Once Day and Week are append-only, every piece
  of writing has a stable identity, an honest timestamp, and a revision
  history. Unifying later would be a migration *from clean records*, which is
  the easy kind.
- **B → A later is effectively impossible.** Splitting a unified log back into
  domains means re-deriving distinctions that were dissolved.

A also spends its irreversible commitments **one domain at a time, in small
pieces, each independently verifiable.** B makes them once, globally, and
permanently — including a kind vocabulary that carries the same permanence as
atmosphere ids.

**A preserves the option to build B. B spends it.** Nothing currently requires
spending it.

## 4. Cross-domain references → **`(domain, id)` is sufficient**

Precisely, restricted to what exists or is constitutionally implied:

- **Today, nothing persistently references a piece of writing.** Not one
  feature.
- **Echo** selects and displays writing but stores no reference — it
  recomputes each day from a pure function.
- **Return Modes** need *kind*, which `(domain, id)` carries inherently.
- **Threads** would need persistent references — but threads are recorded in
  the Constitution's appendix as a **future possibility explicitly marked not
  law**, with an unmet reopen condition. They cannot justify architecture
  today.

So a global address space is required by nothing.

`(domain, id)` is also **strictly more informative** than a single opaque id:
it carries provenance for free, and the deduplication work proved provenance
is load-bearing — it was the only thing that distinguished "the same writing"
from "two writings" without guessing at text.

The cost is that consumers handle a small union. That is real, and it is
bounded by four to six domains.

## 5. Retrieval → **differently implemented, not meaningfully harder**

Retrieval needs a corpus, not a store. `collectArchiveEntries` already
produces the corpus, is pure, and is tested per branch.

The one thing it lacks is **stable identity on results**, so that opening a
result can navigate to the thing. Under A that is `(domain, id)` — and
carrying it through is precisely the "retrieval gets its own translator"
conclusion already reached when `collectArchiveEntries` was reviewed as a
compatibility boundary.

Under B, retrieval queries one materialised store. Marginally simpler, and it
introduces an obligation A does not have: keeping that store consistent with
the domains that produce it.

**A has a genuine head start here** — the corpus function already exists.

## 6. Migration cost → **A requires far fewer permanent commitments**

**A commits to:** revision semantics for two more domains (already frozen and
proven), and a time-precision model for `Day.intention`, which has no
timestamp of its own.

**B commits to all of that, plus:** a global Entry schema, a kind vocabulary,
a subject-period model, source identity as a permanent concept, a dual-write
transition, and a decision about whether Direction leaves its freeze.

Note carefully: **the precision problem exists under both options.** It is a
consequence of `Day.intention` never having had a timestamp, not of any
choice about Entry. It is not a reason to prefer B.

## 7. Failure modes

**Option A**

1. **Shadow unification.** Retrieval, export and artifacts each build their own
   read-time projection of "everything written," and the four drift apart —
   producing a de facto Entry with none of its invariants. *This is A's real
   risk and it must be named in the decision, not discovered later.*
2. **Divergent revision semantics** across four domains. Largely mitigated: the
   engine is already extracted, zero-import, and enforced by an architectural
   fitness test.
3. **Compound keys are awkward** if threads ever arrive — a two-column edge
   instead of one.

**Option B**

1. **Building for a justification that no longer holds** — the roadmap's stated
   reason is already satisfied by the collector.
2. **Field accumulation.** The sketch already carries four optional fields;
   Entry becomes a union of every container it replaced, at which point
   unification bought nothing.
3. **Unfreezing Sprint 1** to absorb Direction, risking the only working
   append-only domain in the product against an unproven model.

---

## 8. Decision → **Option A. Do not build Entry.**

**This overturns `ROADMAP.md` P1.2**, which is described there as the single
most important technical item in the plan.

The reasoning, in order of weight:

1. **Reversibility.** A preserves the option to build B from clean data. B
   cannot be undone. Nothing today requires spending that option.
2. **The stated justification is obsolete.** The collector already solves the
   four-integrations problem, and export proved it in production.
3. **Nothing needs a global address space** — not today, and not by any
   constitutional implication. Threads are explicitly not law.
4. **B adds a layer without removing one.** Days and weeks survive as concepts
   either way.
5. **A is the pattern already frozen as the reference implementation.**
   Extending it is work the project has done once and reviewed twice.

### What this does not resolve

Two decisions are required under **either** option and remain open:

- **Time precision.** `Day.intention` has no instant. A migration must be able
  to say "this day, moment unknown" rather than inventing midnight.
- **Withdraw versus erase.** Tombstones hide text; they do not delete it. The
  Fourth Law implies a person may destroy their words, and nothing implements
  that.

### Consequences

- P1.2 is not built. Phase 2 becomes: apply the revision engine to Day's
  intention and to Week's reflection, independently.
- The `Entry` domain specification is shelved, not discarded. If A→B is ever
  wanted, it becomes a migration from clean append-only records.
- **Mitigation for A's principal risk:** there must be exactly **one shared
  corpus function** that every reader — export, retrieval, artifacts — builds
  on, with per-consumer translators above it. Four independent projections is
  the shadow-unification failure, and it is the thing to watch for.

### What would reopen this

- Threads becoming law rather than an appendix possibility, with a real need
  for persistent cross-domain references.
- A feature that genuinely requires one address space, which none does today.
- Evidence that per-domain revision semantics are diverging in practice
  despite the shared engine.
