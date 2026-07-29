# How SER Decides

Companion to [CONSTITUTION.md](CONSTITUTION.md).

The Constitution says what SER believes. This says how to use it when someone
proposes something at four in the afternoon and everyone is tired.

It is written for a room in which nobody helped create SER. It assumes good
people, real deadlines, commercial pressure, and a genuinely attractive
proposal. Those are the conditions under which products drift — not bad
intentions.

**If this document and the Constitution ever disagree, the Constitution wins,
and this document is wrong and must be fixed.**

---

## The default

**The default answer is no.**

Not because caution is a virtue, but because of an asymmetry: a good feature
rejected can be proposed again next year at almost no cost. A bad feature
shipped is in the archive, in the habits of a million people, and in the
product's character — often permanently.

The burden of proof is on the proposal. Silence from the framework is not
consent.

**"Not yet" is a complete answer.** It is not a soft no or a way to avoid
conflict. It is a verdict, and it must be recorded with the condition that
would reopen it.

---

## The process

### Stage 0 — Restate it

Before evaluation, someone **other than the proposer** describes the proposal in
terms of a person's life, using no product vocabulary. No feature names, no
metrics, no comparisons to other apps.

> Not: "on-device semantic retrieval over historical entries"
> But: "she wants to find the things she wrote about her father"

If nobody in the room can do this, the discussion ends here — not because the
idea is bad, but because it isn't understood yet. Most bad features survive
review by never being stated plainly.

This stage also separates the **need** from the **mechanism**. Almost every
rejection below rejects a mechanism while keeping the need alive. Write both
down separately.

### Stage 1 — The Gates

Four questions. Any *yes* ends the discussion immediately. No mitigation, no
scoping down, no pilot, no "what if we only…".

> **G1. Does it require anyone but the person to read what they wrote?**
> Including us. Including a model we run. Including "anonymized."
>
> **G2. Does it judge?**
> Scores, grades, percentages, verdicts, comparisons to other people, or any
> number that can fall. Also: **anything that decides which of a person's own
> writing is worth resurfacing.** Substance thresholds and length floors are
> verdicts in structural clothing, and they discard the mundane note that
> becomes the best echo in ten years. Improve how a memory returns, never
> whether it may.
>
> **G3. Does it punish absence, or manufacture a reason to return?**
> Anything that references missed days, or interrupts without holding something
> the person already wrote.
>
> **G4. Does it require the person to maintain it?**
> Filing, tagging, sorting, cleaning, an inbox, a backlog, a structure that
> decays without attention.

Gates are run **first and out loud**, before merits are discussed. This ordering
is deliberate: once a room has spent forty minutes admiring a proposal, it will
find a way around a gate. Run them in the first five minutes, while nobody is
invested.

**Nobody can override a gate.** Not the founder, not the board, not the
customer, not the market. Anyone may argue a Test. No one may argue a Gate.

### Stage 2 — The Tests

These are graded, not binary. They require argument, and a proposal can fail one
and still proceed if the argument is strong and recorded.

**T1. The Ten-Year Test.** What is this worth in week one, and in year ten? A
proposal whose value is flat across that span is a convenience. Conveniences are
not forbidden, but they must be *argued for*, and they accumulate into clutter
faster than anyone expects.

**T2. The Weight Test.** Does this grow the archive, or the application? Things
that add to what a person has are nearly free. Things that add to what a person
must understand are permanent and expensive. If it enlarges the interface, name
what is being retired, or state explicitly that SER is now larger forever.

**T3. The Absence Test.** Play it out for someone who leaves for eight months
and returns. Does it welcome them, ignore them, or accuse them? Anything that
degrades, expires, breaks, or nags across a long absence fails.

**T4. The Voice Test.** Whose words does the person encounter — theirs or ours?
Quoting is always permitted. Composing in their voice never is. Between those,
the ratio should move toward theirs over the product's lifetime.

**T5. The Day-One Test.** What does this do when there is nothing? An empty
state is not a failure, but a feature that is *meaningless* for the first six
months has to justify the wait — and must never be made to feel full by
fabrication.

### Stage 3 — Verdict

One of four, recorded in writing:

| Verdict | Meaning |
|---|---|
| **Belongs** | Passes gates, tests are strong. Build it. |
| **Belongs, bounded** | Passes, with an explicit line written down that must never be crossed. The line is part of the spec, not a note. |
| **Not yet** | Passes in principle, blocked on a stated condition. Record the condition. |
| **Never** | Fails a gate, or fails the Constitution. Record which one. |

---

## The Ledger

Every verdict is recorded: the proposal, the need beneath it, the verdict, the
reasoning, and — for *not yet* — the exact condition that reopens it.

The Ledger exists to solve two opposite failures:

**Re-litigation.** The same attractive idea returns every few quarters until a
tired room finally says yes. Without a record, each round starts from zero and
the proposal only has to win once.

**Ossification.** Conditions change. A *not yet* from 2029 may be *obviously
yes* by 2034, and without a written reopen condition nobody will notice.

A rejection with no reopen condition is a *never*. Say so, so it can be argued
honestly rather than smuggled back in disguised.

---

## Compromise

**Direction is not negotiable. Magnitude always is.**

You may compromise on how much, how visible, how soon, how polished, how many
people see it. You may never compromise on which way it points.

- Ship a smaller version — fine.
- Ship it later — fine.
- Ship it to fewer people — fine.
- Ship a *slightly* punitive version, a *slightly* louder version, a version
  that reads *a little* of their writing — never.

The test for whether something is direction or magnitude: **would a larger dose
of this be worse, or just more?** If more of it is worse in kind, it is
direction, and it is not available for trade.

---

## Resolving the standing conflicts

Each has a general rule underneath, stated last.

**Privacy vs. intelligence → privacy.**
Not because intelligence doesn't matter, but because the harms are asymmetric in
time. Intelligence deferred can be built in 2032. A privacy breach is
retroactive — it reaches back and changes what every past entry meant when it
was written. You cannot un-read a journal.

**Simplicity vs. capability → simplicity, with a distinction.**
The enemy is not capability, it is *surface*. Depth is cheap; breadth is
permanent. A feature that makes an existing thing do more is usually fine. A
feature that adds a new thing to understand is charged against a fixed budget
that never grows.

**Silence vs. engagement → silence.**
Engagement measures the product's need for the person, not the person's need for
the product. It is the metric most likely to be available and least likely to
mean anything here.

**Ownership vs. lock-in → ownership.**
Lock-in degrades the asset it protects. People write honestly in places they can
leave, and honest writing is the entire product. A moat made of friction drains
the thing it surrounds.

**Growth vs. philosophy → philosophy, with a distinction.**
Growth *from* the product being good is welcome and unlimited. Growth
*mechanisms* — referral loops, virality on private content, engagement
funnels — are forbidden. The question is never "does this grow?" but "does this
grow by making SER better, or by making SER louder?"

**Convenience vs. truth → truth.**
This is the most dangerous conflict because convenience is always locally
correct and never obviously wrong. Every individual convenience is defensible;
the aggregate is a different product. Convenience is how products die politely.

**Emotion vs. accuracy → both, in a strict order.**
SER is emotional and must never be false. Emotional *framing* of true things is
the craft. Emotional *content* that isn't true is forgery. "You have returned to
this 147 times since March" — warm and true. Anything warm and invented — never,
no matter how good it feels.

**Beauty vs. clarity → clarity.**
In SER these almost never actually conflict; when they appear to, the beauty was
decoration. Real beauty here is a consequence of the right thing being clearly
shown.

**The general rule:** when two goods conflict, choose the one that **cannot be
rebuilt later.** Capability, revenue, and polish are recoverable. Trust, truth,
and character are not.

---

## Vocabulary

Shared language is how a framework survives the people who wrote it. These are
meant to be said out loud in meetings.

> **The Archive grows. The Application stays small.**

> **Never optimize the first week at the expense of the fifth year.**

> **Direction is not negotiable. Magnitude always is.**

> **Evidence, not verdict.** We may show what happened. We may not say what it means.

> **Quote, don't compose.**

> **A number that can fall is a threat.**

> **If the person has to tidy, we failed.**

> **Not yet is a complete answer.**

> **Demand is not an argument.** Many people wanting something is information
> about the market, not about SER.

> **Reject the mechanism, keep the need.** Almost every good rejection does this.

> **Return modes, not quality filters.** We get better at *how* a memory comes
> back, never at judging whether it earned the right to.

> **Build for the one who returns after a year, not the one who never left.**

> **If leaving is hard, we have already lost.**

> **What demos in five minutes is rarely what matters in five years.**

> **Choose the good that cannot be rebuilt later.**

---

## Anti-patterns

Drift is never a decision. It is a hundred reasonable decisions pointing very
slightly downhill. These are the shapes it takes.

**The demo bias.** Reviews, meetings, investor calls and app-store screenshots
are all five minutes long. Features that are legible in five minutes
systematically beat features that matter over five years — charts beat memory,
dashboards beat silence. This is structural, not a failure of taste, and it must
be actively corrected for. *Counterweight: in every review, ask what this looks
like on day 3,650.*

**Vocabulary drift.** The words change before the product does. When the room
starts saying *users* instead of *people*, *habits* instead of *practices*,
*engagement* instead of *return*, *content* instead of *what they wrote* — the
decisions have already begun to change. **Language is the earliest detectable
symptom.** Audit it deliberately.

**The settings escape hatch.** Two people disagree about a design, so it becomes
a preference. Configuration is not a compromise; it is a decision not made,
handed to the person as work. Each one is small and they compound into a
control panel. *Ownership is earned by accumulation; personalization is a
settings screen. Only one of those is SER.*

**The empty-state panic.** Day one feels sparse, so someone proposes filling it
with generated content, samples, or simulated history. This is forgery and it
poisons the well: a person who once found something fake in their record can
never fully trust the rest. *The correct fix for an empty archive is always to
help them put something true in it.*

**Metric substitution.** Archive value in year ten is nearly unmeasurable.
Weekly actives are measurable today. Teams optimize what they can see, so
without discipline the visible proxy silently becomes the goal.

**Power-user capture.** The loudest few percent want configuration, exports of
exports, keyboard shortcuts for everything, and complexity they can master.
They are not the people SER is for, and they will drag the product toward being
a tool.

**The competitive mirror.** "Everyone has AI summaries now." That is a fact
about them. If SER's differentiation is that it refuses something, then every
competitor adopting it makes SER *more* distinctive, not less.

**Just one notification.** There is never one.

**The founder-absence tell.** Ask: would this have shipped in year one, when
the product had nothing to lose and everything to prove? If the honest answer is
"no, we'd never have done that then," something has changed, and it probably
wasn't the principle.

### The annual audit

Once a year, deliberately: read the Constitution aloud. Read the last year of
Ledger entries. Count how many *bounded* verdicts had their boundaries quietly
crossed. Audit the vocabulary used in the last four reviews.

Drift is only invisible at close range.

---

## Ten proposals, worked

These are the reasoning, not just the answers. The reasoning is the part that
transfers.

### 1. AI summaries of your year — **Never**

**G1 fails** the moment a model reads the entries; **T4 fails** regardless, since
a summary replaces the person's words with ours.

Stop at the gate. But record the need — *she wants to understand what her year
was* — because it is completely legitimate and appears again in #10 with an
acceptable mechanism.

*Reject the mechanism, keep the need.*

### 2. Cloud AI search — **Never**

**G1 fails.** Not a close call.

Note precisely what is rejected: the *cloud*, not the *search*. Retrieval is
constitutionally required — the Third Law forbids making people file, which
means SER owes them a way to find things. This proposal is the right need with
the one forbidden implementation. See the Appendix of the Constitution for the
condition under which the local version becomes buildable.

### 3. Social sharing — **Never**

Fails Article II: a private record has no audience. Sharing introduces a reader,
and a person who writes knowing they may share writes differently — which
corrupts the archive at the source, silently and permanently. The cost is not to
the feature; it is to every entry written afterward.

**The distinction that matters:** a person exporting something they made and
sending it themselves is *ownership* (Fourth Law) and is fine. A share button
inside SER is *social* and is not. The difference is whether an audience exists
at the moment of writing.

### 4. Mood analytics and charts — **Never**

**G2 fails.** A chart of your emotional state across the year is a verdict
wearing the costume of neutrality, and it invites optimization of a life.

The need — *I want to know how I have been* — is real and important. The
constitutional answer is to meet it with their own sentences from those months,
which is truer, more useful, and impossible to game. *Evidence, not verdict.*

### 5. Voice journals — **Belongs**

Gates: clear. Tests: strong across the board.

- **T1:** compounds unusually well. A transcript from twenty years ago is
  valuable; an actual voice is irreplaceable, and it is the one thing in the
  archive that cannot be reconstructed from anything else.
- **T3:** excellent — speaking is the lowest-friction path back after a long
  absence, when writing feels like too much.
- **T4:** maximally their voice, literally.

**Bounded:** the recording is the record; any transcript is a convenience for
retrieval and never replaces or edits it. Transcription is local or it does not
happen (G1).

One of the strongest proposals in this list.

### 6. Family / shared archive — **Not yet**

Genuinely hard, and it splits into two different proposals that get confused.

*Collaborative writing in a shared space* — **Never.** Same failure as #3: an
audience at the moment of writing.

*Inheritance — an archive with a designated reader after a death* — **Not yet.**
It passes the gates and is powerful enough to define the category. It is blocked
on one thing only, and it is not technical:

> **Reopen condition:** SER can credibly commit to an obligation measured in
> decades — institutional, legal and financial, surviving acquisition and
> insolvency.

A broken inheritance promise is the most damaging failure available to this
product. Until the promise can be kept, it may not be made, mentioned in
marketing, or implied in the interface.

### 7. Gamification — **Never**

**G2 fails** immediately. Records, streaks, levels and rewards all require a
number that can fall.

Included here mainly to demonstrate that the gates should dispose of it in under
a minute. If a room ever spends thirty minutes on this, the problem is not the
proposal.

### 8. Home-screen widget — **Belongs, bounded**

Interesting because it is genuinely close.

A widget is an attention surface, and **G3** is the risk: most widgets exist to
pull people in. But a widget can also be the purest possible expression of the
Seventh Law — something the person already wrote, sitting quietly on their
screen, asking for nothing.

**T2** is unusually good: it adds no interface at all. Nothing new to learn.

**The bright line, which is part of the spec:** the widget may display only the
person's own words, or nothing. No counts, no streaks, no prompts to write, no
unfinished-business indicators, no badge. If it is ever empty, it stays empty.

Cross that line and it becomes a re-engagement surface, which is a different
product.

### 9. Location memories — **Belongs, heavily bounded**

The most instructive case here, because it appears to be constitutionally
*endorsed*: the Constitution says *where a person was is part of what they
wrote*.

**That is a misreading, and catching it is the point of this framework.** The
Constitution says that about atmosphere — an environment the person *chose*, at
the moment of writing, as an expression of how they wanted to be. GPS is
something a device *observed about* them. Those are opposite in authorship.

Passively collected location is surveillance data in an archive that claims to
contain only what a person put there, and it fails **T4**: it is the device's
account of their life, not theirs.

**Permitted:** the person writes where they are, and SER remembers it because
they said it.
**Forbidden:** background collection, automatic tagging, maps of movement,
"you were here" resurfacing built from data they never authored.

*The general principle this establishes: the archive contains what a person
said, never what was noticed about them.* Apply it to anything sensor-derived —
health, activity, screen time, sleep.

### 10. The printed year — **Belongs**

The strongest proposal in the list, and worth studying as a model of fit.

- **T1:** exceptional. Impossible in year one; extraordinary in year ten.
  Compounds with nothing but time.
- **T2:** grows the archive and leaves the application untouched — it produces
  an object that *leaves the software entirely*.
- **T4:** entirely their words.
- **T3:** it is a superb reason to return after an absence, and it never asks.
- **G1:** satisfied if generated on-device.

It also answers the same need as #1 — *what was my year* — with the opposite
mechanism: their sentences, chosen by time rather than interpreted by a model.
**The same need, well served, is the best argument for rejecting a bad
mechanism.**

---

## What this document cannot do

It cannot make the right decision for you. It can only make the wrong decision
harder to reach accidentally, and impossible to reach quietly.

Every genuinely difficult case will feel like an exception. Most will not be.
The rare real exception should be resolved by returning to Article I and arguing
from there in the open, with the answer written in the Ledger — not by finding a
reading of this document that permits what was already decided.

If you find yourself constructing an argument for why a gate does not quite
apply here: that feeling is the framework working, and the answer is no.
