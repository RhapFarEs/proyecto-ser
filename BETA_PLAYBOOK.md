# SER — Beta Playbook

How to run the first beta. Procedures only.

[PRODUCT_MANUAL.md](PRODUCT_MANUAL.md) is the source of truth for what SER
does. [BETA_STRATEGY.md](BETA_STRATEGY.md) holds the reasoning behind the beta's
shape — this document does not repeat it. [DECISIONS.md](DECISIONS.md) governs
every yes and no. This is the operating manual: what to do, in what week, with
what response time.

**Assume one person, part-time.** Every deadline below is set for that, not for
a team. A playbook that assumes capacity nobody has is a playbook nobody runs.

---

# 1. Purpose of the Beta

## The one question

**Does anyone return to their own archive?**

Everything else is secondary. SER's entire premise is that writing accumulates
into something worth coming back to. If people write and never look back, the
product is a nice writing surface and should be understood as one.

## What we are trying to learn

| # | Question | How we will know |
|---|---|---|
| L1 | Do people keep writing without being prompted? | Week-12 write rate |
| L2 | Does Echo land? | Unprompted mention in interviews |
| L3 | Does anyone look back at their own writing? | Direct observation + interviews |
| L4 | Is silence read as respect or as absence? | Month-1 and Month-3 interviews |
| L5 | Do people write honestly here? | Month-3 interview, question 7 |
| L6 | Where does the interface confuse people? | First-session observation |
| L7 | Does anything lose writing? | Bug reports, and the answer must be *no* |

## What we are explicitly NOT validating

Do not treat any of these as beta outcomes, and do not let a conversation drift
into them:

- **Whether the philosophy is correct.** It is settled in the Constitution and
  is not on trial here.
- **Whether SER can create a journaling habit.** We are recruiting people who
  already journal. Habit formation is a different product.
- **Pricing, market size, growth, or positioning.** Fifty people cannot answer
  any of these.
- **Whether unbuilt features would be liked.** Nobody can validate something
  that does not exist.
- **Architecture.** Frozen. A defect that loses data reopens it; nothing else
  does.
- **Feature parity with any other product.**

---

# 2. Success Criteria

Four categories. Measured at week 12.

## Product success

| # | Criterion | Threshold |
|---|---|---|
| P1 | Activated users still writing in week 12 | **≥40%** |
| P2 | Users who recall an echo unprompted | **≥60%** |
| P3 | Users who opened a past day at least once | **≥40%** |
| P4 | Users who can correctly describe what Camino is | **≥60%** |

*Activated* = completed onboarding and wrote at least once. Anyone who never
wrote is excluded from all rates and counted separately as a recruiting miss.

## User success

| # | Criterion | Threshold |
|---|---|---|
| U1 | Can name something concrete they have now and did not before | ≥half the cohort |
| U2 | Would notice if SER shut down tomorrow | ≥half |
| U3 | Described SER to someone else, unprompted | ≥3 people |
| U4 | Reports never having felt behind, judged or watched | **100%** — any exception is investigated as a defect |

## Technical success

| # | Criterion | Threshold |
|---|---|---|
| T1 | Incidents of lost or corrupted writing | **0** |
| T2 | Users who could not complete sign-in | **0** |
| T3 | Critical bugs open longer than 24h | **0** |
| T4 | Users stuck on a stale build after a fix shipped | **0** |

## Trust success

| # | Criterion | Threshold |
|---|---|---|
| R1 | Users who report self-censoring here | **0** |
| R2 | Users who exported at least once | ≥25% |
| R3 | Users who edited or deleted something after the fact | ≥50% — confidence to correct is confidence to write |
| R4 | Account deletion requests honoured within 7 days | 100% |

**T1 and R1 are absolute.** A single instance of either ends the beta for
review, regardless of every other number.

---

# 3. Beta Timeline

Thirteen weeks, W0 to W12. Each week has a **freeze** — things that must not
change that week, so the cohort is testing one product rather than a moving
one.

### W0 — Preflight (no users)

**Goals.** Close the eight blockers in PRODUCT_MANUAL §12. Verify sign-in on a
real iPhone and a real Android. Remove the two test rows from `feedback`. Write
the invitation and the consent line.
**Observe.** Nothing — there is nobody to observe.
**Do not change.** Anything not on the blocker list.
**Exit gate.** All eight closed, or W0 extends. Do not invite on a partial list.

### W1 — Wave 0 (5 users)

**Goals.** Five first sessions, run personally (§5). Catch the embarrassing.
**Observe.** Where hands hesitate. Which words are misread. Whether anyone
writes something real on day one.
**Do not change.** Nothing ships this week except Critical fixes. Resist every
urge to fix a wording problem mid-week — write it down instead.

### W2 — First repairs

**Goals.** Ship the batch of fixes W1 produced, in one deploy. Day-1 and Week-1
async questions to the five.
**Observe.** Whether anyone opened SER on a day nobody asked them to.
**Do not change.** Navigation, Echo, atmospheres, any copy not implicated by W1.

### W3 — Quiet

**Goals.** None. Do not ship. Do not contact anyone except the Friday pulse.
**Observe.** Natural return behaviour with no external prompt. This week is the
first honest read on L4.
**Do not change.** Anything.

### W4 — Wave 1 (+15 users, 20 total)

**Goals.** Fifteen first sessions, batched. This is the learning cohort.
**Observe.** Whether W2's fixes removed the W1 confusions, on fresh eyes.
**Do not change.** Nothing ships during onboarding week except Critical.

### W5–W6 — Repair and settle

**Goals.** Ship the Wave 1 fix batch. Month-1 interviews for Wave 0.
**Observe.** First echoes are now landing for Wave 0 (14-day floor). L2 becomes
answerable for the first time.
**Do not change.** Echo. Under no circumstances tune Echo during the window
where it is first being measured.

### W7 — Wave 2 (+30 users, 50 total)

**Goals.** Volume for retention signal. Lighter contact — invitation, first
session self-served, Friday pulse only.
**Observe.** Whether unaccompanied users reach a first write without a guide.
**Do not change.** Anything, during the onboarding week.

### W8–W9 — The cliff window

**Goals.** Month-1 interviews for Wave 1. Watch for silent drop-off.
**Observe.** Gap recovery. Who has stopped, and interview them specifically.
**Do not change.** Do not add anything to fight drop-off. Measuring the cliff is
the point of the beta; softening it destroys the measurement.

### W10–W11 — Read-back window

**Goals.** Answer L3 directly. In every interview this fortnight, ask about
looking back before asking about anything else.
**Observe.** Whether anyone has gone looking for something and whether they
found it.
**Do not change.** Search. Camino.

### W12 — Exit

**Goals.** Exit interviews for **everyone**, including — especially — those who
stopped. Compile the End of Beta Review (§11).
**Observe.** Everything, one last time.
**Do not change.** Nothing ships in W12. Freeze the build so the exit interviews
all describe the same product.

### Standing weekly rhythm

| Day | Action |
|---|---|
| Monday | Read the week's `feedback` rows and pulse replies. Triage only (§8). No decisions |
| Tuesday | Decide what the evidence supports. Record every decision, including refusals, in the DECISIONS Ledger |
| Wed–Thu | Build only what Tuesday authorised |
| Friday | Ship one deploy. Send the pulse question |
| Weekend | Nothing. A product about not competing for attention should be built by someone who stops |

**One deploy per week, on Friday**, except Critical fixes. Batching means a
tester's experience is stable Monday to Thursday, which is what makes their
report interpretable.

---

# 4. Recruiting Users

## Waves

| Wave | Size | Week | Contact |
|---|---|---|---|
| 0 | 5 | W1 | Personal first session, weekly calls |
| 1 | 15 | W4 | Batched first sessions, Month-1 call |
| 2 | 30 | W7 | Self-served, Friday pulse, exit interview |

Never invite everyone at once. You get one first impression per wave, and the
first two waves exist to make the third one worth having.

## Invite

- **Already journals** — paper, Notes, Day One, anything. Non-negotiable for
  Waves 0 and 1.
- **Writes comfortably in Spanish.**
- **Mobile-primary.**
- **At least three people who will be blunt**, and are not friends.
- **Wave 2 only:** up to 20% who do not currently journal, as a control on L1.
  Their churn is never read as a product failure.

## Do not invite

| Excluded | Why |
|---|---|
| Friends and family who will be kind | False positives, and impossible to remove later |
| Productivity enthusiasts | They will lobby for streaks and metrics, constantly |
| Anyone in acute crisis | SER is not therapy, has no safety net and no escalation path |
| Anyone who would make SER their only copy | Say this explicitly in the invitation |
| Non-Spanish speakers | The product is Spanish-only (PRODUCT_MANUAL §11.23) |
| Anyone who cannot be interviewed at W12 | An untraceable user contributes nothing |

## Invitation template

> Estoy probando SER, un lugar tranquilo para escribir cada día.
>
> Antes de aceptar, tres cosas honestas:
>
> - Está en beta. Puede fallar.
> - **No lo uses como tu única copia de nada.** Puedes descargar todo lo que
>   escribas cuando quieras, desde Más → Descargar mi archivo.
> - Lo que escribes es tuyo. Nadie lo lee: ni yo, ni ningún modelo.
>
> Te pediré 20 minutos ahora, 20 más dentro de un mes, y 45 al final —
> también si dejas de usarlo, que es la parte que más me sirve.
>
> ¿Te apuntas?

**Consent, said once and recorded:** the person is told what is stored, that
nobody reads it, that they can export at any time, and how to have their
account removed. Do not begin a first session without this.

---

# 5. First Session

Sixty minutes, in person or over a call with their screen shared. This is the
single richest hour of the entire beta.

## Protocol

| Minutes | What happens |
|---|---|
| 0–5 | Consent. Explain the beta, not the product |
| 5–10 | Hand it over. *"Instálalo y empieza. Yo no digo nada."* Then stop talking |
| 10–30 | **Silent observation.** Do not help. Do not answer questions with answers |
| 30–40 | Ask them to write something real, not a test entry |
| 40–50 | *"Enséñame lo que crees que hace cada pantalla."* Let them be wrong |
| 50–60 | Day-1 questions (§6). Confirm the next contact |

## The rule of the silent twenty minutes

Between minute 10 and 30 you may say only:

- *"¿Qué estás pensando?"*
- *"¿Qué esperabas que pasara?"*
- *"Haz lo que harías si yo no estuviera."*

If they ask a direct question, reflect it: *"¿Qué crees tú?"* Answer it at
minute 50, never before. **The moment you explain something, you have destroyed
that finding for that user permanently.**

## Never explain

- What Camino is for
- That Echo exists, or that it takes 14 days
- That the daily line becomes theirs over time
- Where the weekly review lives
- The difference between Archivar and Eliminar
- That notes can only be edited on the day they were written

Each of these is a thing the product must communicate on its own. Explaining it
converts a measurement into a courtesy.

## Acceptable confusion

Note it, do not act on it:

- Pausing before the first write. Everyone does.
- Not knowing what to write about. That is journaling, not SER.
- Not finding Revisión semanal. It is deliberately not in the navigation.
- Not noticing the atmosphere chooser in the first hour.
- Uncertainty about whether a note saved, resolved by seeing *"Guardado."*

## Confusion that indicates a design failure

Act on these — they are defects:

- Cannot tell where to write. **Critical.**
- Believes their writing was not saved after saving it. **Critical.**
- Cannot get through sign-in unaided. **Critical.**
- Taps Guardar in the practice form and cannot work out why nothing happened
  (PRODUCT_MANUAL §11.21). **High.**
- Reads *hábito* and *práctica* as two different things (§11.15). **High.**
- Thinks Camino is a chart, a score, or progress toward a goal. **High** — it
  means the rename did not work.
- Thinks Diario→Historial and Camino are the same screen. **Medium.**

## Record

One page per session: what they did in order, every hesitation with a
timestamp, every question they asked, their exact words when describing a
screen, and whether they wrote anything real. **Verbatim quotes only** — a
paraphrase loses the finding.

---

# 6. Feedback Collection

## Channels

| Channel | Use |
|---|---|
| In-app `/feedback` | Everything unprompted. Categories: Error, Idea, Algo fue confuso, Otro. Each row arrives with `route`, `appVersion`, `device`, `os`, `browser`, `createdAt` |
| Friday pulse | One question, async, same day each week |
| Scheduled interviews | Day 1, Week 1, Month 1, Month 3 |
| Exit interview | Everyone at W12, including churned |

The in-app form is the primary instrument. Do not replace it with a chat group
— a group produces consensus, and consensus is the enemy of five independent
observations.

## When to ask

- **Day 1**, at the end of the first session.
- **Friday**, every week, one question.
- **Month 1** and **Month 3**, scheduled calls.
- **Immediately after a Critical bug is fixed**, to the affected user only.

## When NOT to ask

- **During the silent twenty minutes.**
- **Within 48 hours of shipping a change** — you will get reactions to novelty,
  not to the product.
- **W3.** The quiet week is quiet.
- **More than one question in a pulse.** Two questions halve the reply rate and
  the second answer is always worse.
- **Never ask "would you use X?"** about anything that does not exist.

## Pulse questions, in order

One per week. Never reuse one inside the same wave.

| Week | Question |
|---|---|
| W2 | ¿Qué día de esta semana lo abriste sin pensarlo? |
| W3 | ¿Hubo algún momento en que quisiste escribir y no lo hiciste? ¿Qué pasó? |
| W5 | ¿Te ha devuelto algo que escribiste antes? ¿Qué sentiste? |
| W6 | ¿Has buscado algo que escribiste? ¿Lo encontraste? |
| W8 | ¿Qué parte te salta ya sin leerla? |
| W9 | Si desapareciera esta noche, ¿qué habrías perdido? |
| W10 | ¿Has vuelto a leer algo tuyo de hace semanas? |
| W11 | ¿Le has contado a alguien qué es esto? ¿Qué le dijiste? |

## Useful vs noisy questions

| Useful | Noisy |
|---|---|
| *"¿Cuándo fue la última vez que lo abriste sin pensar en esta beta?"* | *"¿Te gusta la app?"* |
| *"Cuéntame el día que casi lo dejas."* | *"¿Qué le falta?"* |
| *"¿Qué escribiste aquí que no dirías en voz alta?"* | *"¿Recomendarías SER?"* |
| *"Enséñame cómo buscarías algo de marzo."* | *"¿Es fácil de usar?"* |
| *"¿Qué esperabas que pasara al pulsar eso?"* | *"¿Qué opinas del diseño?"* |

The left column asks about a specific past event. The right column asks for an
opinion, and opinions from beta users are worth nothing.

---

# 7. Beta Metrics

## The constraint

**No telemetry exists in SER, and none will be added for the beta.** There is
no analytics library, no event tracking, no instrumentation of any kind.
Adding some would be the fastest way to violate G1 and G5 under deadline
pressure.

Everything below is therefore measured two ways only: **counting queries
against the synced tables**, and **asking people**.

## The counting rule

You own the Supabase project and can query it. The rule that keeps this
constitutional:

> **You may run `COUNT`, `MIN`, `MAX` and `GROUP BY` over ids, user ids and
> dates. You may never `SELECT` a text column.**
>
> `message` in `feedback` is the single exception, because the person wrote it
> *to you*, deliberately, through a form that says so.

Anything that would let you reconstruct one person's story is forbidden even
if technically permitted by the rule. If a query result would embarrass you to
show the person it is about, do not run it.

## What is measured

| Metric | How | Interpretation |
|---|---|---|
| **Activated** | Users with ≥1 row in `journal_entries` or a non-empty intention | The denominator for everything else |
| **Week-12 write rate** | Distinct users with a row created in W12 ÷ activated | **The headline number.** ≥40% is success |
| **Write-days per week** | Count of distinct `dayKey` per user per week | Watched, never targeted, never shown to a user |
| **Gap recovery** | Users with a ≥7-day silence who later wrote again | Tests whether silence works (L4) |
| **Practice adoption** | Users with ≥1 `habits` row, and with completions after W8 | Feeds the §7 kill condition in BETA_STRATEGY |
| **Weekly review adoption** | Users with ≥1 `weeks` row holding reflection text | Same |
| **Direction adoption** | Users with ≥1 `direction` row | Same |
| **Deletion confidence** | Rows with a non-null `deletedAt` | Proxy for R3 |
| **Feedback volume by category** | `GROUP BY category` on `feedback` | Rising *confusing* means the interface is drifting |
| **Version spread** | `GROUP BY appVersion` on `feedback` | Detects users stuck on stale builds (T4) |

## What is measured by asking only

Echo recall (P2), reading back (P3), understanding Camino (P4), self-censorship
(R1), and everything in User success. **None of these can be instrumented
without violating G1**, and the attempt should never be made.

## Never measured

Session length. Time in app. Opens per day. Time of day of writing at any
precision finer than a date. Word counts. Note lengths. Search queries. Mood
labels. Which echo was shown. Anything at all about the content of anyone's
writing.

## How results are reported

One page, weekly, four numbers: activated, wrote-this-week, feedback rows by
category, open bugs by severity. Nothing else goes in the weekly report.
Interpretation waits for the interviews.

---

# 8. Bug Triage

Every report is triaged on the Monday it arrives, or immediately if it looks
Critical. Severity is decided by consequence, never by how loudly it was
reported.

## Critical

**Definition.** Writing is lost, corrupted, misfiled, shown to the wrong
account, or cannot be saved. Sign-in is impossible. The app will not open.

| | |
|---|---|
| Response | Acknowledge the reporter within **2 hours** |
| Fix | Ship within **24 hours**, outside the Friday batch |
| Beta | **Pauses.** No new invitations until fixed. Every affected user is told directly, what happened and what it means for their archive |
| Also | Write a one-paragraph postmortem into the Ledger. Add a test that fails without the fix |

## High

**Definition.** A primary flow dead-ends. A trust surface says something false.
A person cannot complete an action the product plainly offers.

| | |
|---|---|
| Response | Acknowledge within **24 hours** |
| Fix | Next Friday deploy |
| Beta | Continues. Invitations continue |

## Medium

**Definition.** Confusing, inconsistent, or ugly, with a workaround. Wrong
wording. Missing state. Accessibility gaps that do not block a task.

| | |
|---|---|
| Response | No individual acknowledgement required; appears in the weekly summary |
| Fix | Batched. May wait weeks. **May be deliberately deferred past the beta** |
| Beta | Continues |

## Low

**Definition.** Cosmetic. Noticed by one person. Preference-shaped.

| | |
|---|---|
| Response | Logged only |
| Fix | Not during the beta |
| Beta | Continues |

## Triage rules

1. **Two reporters raise the severity one level.** Three make it the week's
   priority.
2. **Anything touching saving, syncing, deleting or exporting starts at
   Critical** and is demoted only after being reproduced and understood.
3. **Never fix a Medium in the same deploy as a Critical.** A hotfix carries
   one change so its effect is unambiguous.
4. **A bug you cannot reproduce is not closed** — it is logged with the
   reporter's `appVersion`, `device`, `os` and `browser` and left open. Silent
   data bugs are exactly the ones that resist reproduction.

---

# 9. Feature Requests

Every request is classified before it is discussed. **A request describes a
problem, never a solution** — the classification step is where that translation
happens.

## The five categories

### 1. Misunderstanding

*The product does this; they did not find it or expected it elsewhere.*

**Handling.** Do not build. Log where they looked first. Three
misunderstandings of the same thing become a **usability issue** about
discoverability. Never respond by explaining it to them and closing the report —
the explanation is the defect.

**Example.** *"No puedo exportar."* It exists, in Más.

### 2. Usability issue

*The product does this and doing it is harder than it should be.*

**Handling.** Triage as a bug (§8), usually Medium. This is the highest-value
category in the beta and should be the largest.

**Example.** *"Guardé y no supe si se guardó."*

### 3. Missing capability

*A reasonable person expects it and the product does not do it.*

**Handling.** Do not build during the beta. Log the **problem**, not the
request. Requires **three independent unprompted mentions** before it enters
the DECISIONS process at all. At W12 the full list is run through the Gates in
one sitting.

**Example.** *"Quiero editar una nota de ayer."* — already a known blocker, so
it is a bug rather than a request. Anything genuinely absent waits.

### 4. Philosophical conflict

*It fails a Gate. G1, G2, G3, G4 or G5.*

**Handling.** Never build. Never argue philosophy with the user. **Take the
problem seriously and the proposed solution not at all**, and record the
underlying problem — it is usually real and usually points at something else.

| They ask for | Gate | The real problem |
|---|---|---|
| Streaks | G2 | They cannot feel their own continuity → Camino has failed |
| Mood charts | G2 | They want to understand a pattern → nothing here can serve this |
| Tags, folders | G4 | They cannot find anything → retrieval |
| Reminders | G3 | They forget SER exists → L4 is failing |
| AI summaries | G1 | Their archive is too big to re-read → reading back is broken |

Each is already recorded as **Never** in DECISIONS.md. Cite the Ledger; do not
relitigate.

### 5. Future opportunity

*Passes the Gates, is genuinely good, and is not for now.*

**Handling.** One line in the Ledger with the verdict **Not yet** and the
condition that would reopen it. No design work. No prototype. No estimate.

## Weekly handling

Classify Monday. Only categories 1 and 2 may result in work. Categories 3, 4
and 5 are logged and closed with a short, honest reply that does not promise
anything:

> Gracias — lo he anotado. Durante la beta no voy a añadir nada nuevo; estoy
> intentando entender qué falla en lo que ya existe.

---

# 10. Decision Rules

## Ship a hotfix when

- A Critical bug is confirmed. Always, within 24 hours.
- A trust surface is saying something false — for example, telling someone
  their writing is saved when it is not.
- Sign-in is broken for any user.

Hotfixes carry one change. Never bundle.

## Wait when

- It is a High or below. It goes in Friday's deploy.
- Fewer than three people have reported the same problem, and it is not
  Critical.
- It arrived within 48 hours of a deploy. Let the novelty settle.
- It is week W1, W4, W7 or W12 — onboarding and exit weeks ship nothing but
  Critical fixes.

## Ignore feedback when

Log it, reply politely, do nothing:

- It fails a Gate.
- It is a preference with no problem behind it (*"prefiero azul"*).
- It comes from a user outside the recruiting profile — a non-journaler asking
  for habit-building features is describing a product SER is not.
- It asks for parity with another product without naming a problem.
- It is one loud voice. **One user is not a signal**, and in a fifty-person
  beta they will feel like one.

## Change the roadmap when

- A §7 kill condition in BETA_STRATEGY is met. Then it is not a change, it is
  an execution of a decision already made.
- Three independent unprompted reports describe the same missing capability.
- The W12 review answers L3 negatively. That reorders everything.

Never change the roadmap mid-week, and never in response to a single
interview, however vivid.

## Rewrite a feature when

- Users can use it but consistently misunderstand what it is for — that is a
  concept problem, not a copy problem.
- It works and is measurably unused by people who were observed reaching for
  its function elsewhere.

Not during the beta. Rewrites are W12 decisions.

## Delete a feature when

- A kill condition fires.
- Nobody in the cohort used it in twelve weeks and nobody asked where it was.
- It exists only to support something already deleted.

Deleting is the preferred response to unused surface. **A feature nobody used
is not evidence that it needs improving.**

---

# 11. End of Beta Review

Compiled in W12, from the exit interviews, the weekly numbers and the Ledger.

## Questions that must be answered

| # | Question | Source |
|---|---|---|
| Q1 | What share of activated users wrote in week 12? | Counting |
| Q2 | Did Echo land, and for whom? | Interviews |
| Q3 | Did anyone go back to their own writing? Did they find it? | Interviews + counting |
| Q4 | Why did each person who stopped, stop — specifically, on which day? | Churn interviews |
| Q5 | Did anyone write something here they had not said aloud? | Month-3 Q7 |
| Q6 | Did anyone feel judged, behind, or watched? | Month-3 Q5 |
| Q7 | How did people describe SER to someone else, in their words? | Month-3 Q6 |
| Q8 | Which of the four kill conditions fired? | Counting |
| Q9 | Was any writing ever lost? | Bug log |

Q4 is the hardest to obtain and the most valuable. Budget the most effort
there.

## Evidence required before v1

All of the following, or v1 does not proceed:

1. **P1, T1 and R1 met** — ≥40% week-12 writing, zero data loss, zero
   self-censorship.
2. **Q3 answered affirmatively by at least 40%.** Without this, the archive
   thesis is unproven and v1 would be built on an assumption the beta was
   designed to test.
3. **Every Critical bug closed with a regression test.**
4. **Account deletion exercised at least once, end to end**, by a real user
   who asked for it.
5. **The full W12 request list run through the Gates**, with every verdict in
   the Ledger.

## Justifies extending the beta

- Recruiting missed: fewer than 20 activated users, so the numbers are noise.
- A Critical bug in the last three weeks distorted the retention window.
- Q4 is unanswered because too few churned users could be reached. Extend to
  reach them; this question is worth four extra weeks on its own.
- The cohort skewed — for example, almost nobody recruited actually journalled
  beforehand.

Extend by a fixed period with a stated question. **Never extend open-endedly**;
an open-ended beta is a way of not deciding.

## Justifies stopping development entirely

Any one of these, honestly assessed:

- **Week-12 writing below 15%** among people who already journalled. That is not
  a retention problem, it is an absence of demand.
- **Echo did not land for anyone.** SER's thesis is that returned writing
  creates continuity. If it does nothing for people who write daily, the
  premise is wrong and no amount of building fixes it.
- **Writing was lost and the cause could not be established.** A product
  promising a ten-year archive cannot ship on an unexplained data loss.
- **Users report self-censoring** here relative to a paper notebook. The
  product would then be actively worse than the thing it replaces.
- **Nobody, in twelve weeks, ever went back to read anything.** SER would be a
  writing surface with an unusually elaborate archive nobody opens — and it
  should be either rebuilt as something else or stopped.

Stopping is a legitimate outcome of a beta and should be written down as one
before it starts, so that reaching it is a decision rather than a failure.
