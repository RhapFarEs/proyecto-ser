# SER Beta Strategy

The operating manual for the next twelve months.

This document does not replace [CONSTITUTION.md](CONSTITUTION.md) or
[DECISIONS.md](DECISIONS.md). It replaces [ROADMAP.md](ROADMAP.md) as the
thing the team works from, because the roadmap was written to resolve
contradictions between the product and its own constitution — a job that is
now largely done — and the beta exists to resolve contradictions between the
product and the people using it, which is a different job with different
inputs.

**The one sentence:** we are launching to learn whether anyone returns to
their own archive, and everything here is arranged around finding that out
without violating the Seven Laws to do it.

---

# Part 1 — Is the roadmap still correct?

Judged only by: *does this help us launch and learn from 50 people?*

The short answer is no. Of the fourteen remaining roadmap items, **two should
stay, four should wait for evidence, four should be deleted, and four are
janitorial.** None of the four launch blockers identified in the beta audit
appear in the roadmap at all — which is the strongest evidence that the
roadmap has stopped describing the product's actual risk.

| Item | Verdict | Why |
|---|---|---|
| **P1.4 — promote Camino in navigation** | **Move earlier** | The audit found the archive is the thing that compounds and the thing nobody can reach. Promoting it is cheap and it is the only roadmap item that directly addresses the month-three cliff. |
| **P1.6 — retire the word *hábito*** | **Stay** | Trivial, and the product currently contradicts its own vocabulary in the nav bar, which is the first thing 50 people will read. |
| **P1.6 — feedback form becomes a link** | **Remove, and reverse it** | Written when feedback was cosmetic clutter. During a beta, feedback is the primary instrument. Make it *more* reachable, not less. Revisit after the beta ends. |
| **P1.4 — Revisión semanal as a nav destination** | **Wait for evidence** | We do not yet know whether anyone completes a weekly review. Promoting an unused ritual to the nav bar makes the interface larger to advertise a failure. Gate on §7. |
| **P1.5 — practices rebuilt** | **Wait for evidence** | Medium-complexity redesign of a feature we cannot yet confirm anyone uses. Building it before the beta is a bet placed with no information. Gate on §7. |
| **P2.1 — question-based retrieval** | **Wait for evidence** | Lexical search shipped. Whether it is *sufficient* is one of the sharpest questions the beta answers. Building the question layer first would destroy the experiment. |
| **P2.3 — return modes** | **Wait for evidence** | The premise (an intention handed back reads as an unfinished task) is a hypothesis nobody has tested on a real person. The beta tests it for free. |
| **P1.1 — resolve legacy `Day` fields** | **Remove from roadmap** | Existed solely as a prerequisite for the Entry keystone, which ADR-0001 retired. It is now debt with no consumer. Keep as janitorial, never as a phase. |
| **P1.3 — one writing surface** | **Delete** | The highest-risk item ever written into this roadmap, aimed at a problem no user has reported. Its stated dependency no longer exists. Deleting it is the single largest risk reduction available. |
| **P2.2 — threads** | **Delete from the roadmap; keep as a hypothesis** | Highest complexity, highest quality-risk, and it presumes people revisit their archive — which is exactly what we do not yet know. It cannot be scheduled. It can only be earned. See §7. |
| **P2.4 — the printed year** | **Delete from the roadmap** | Beautiful and premature. Requires a year of writing to exist. Revisit at month 12, not before. |
| **P2.5 — practice retrospectives** | **Delete from the roadmap** | Depends on two things that may not survive the beta. |
| **G5 — the observer test in DECISIONS.md** | **Move earlier — do it now** | Already acknowledged as owed. A beta is precisely when observation pressure appears ("can we just log what they wrote to debug it?"). Write the gate before the temptation, not after. |
| **Migration automation** | **Later** | Real debt, invisible to 50 users. |
| **Two test rows in production `feedback`** | **Before launch** | Contaminates the only dataset the beta produces. Ten minutes. |

### What replaces the roadmap

Four launch blockers from the audit, none of which the roadmap contains:
past-note editing and deletion, account deletion, a privacy policy, and a
network-first service worker. These are not roadmap items. They are the
conditions under which it is honest to ask 50 people for their interior
lives.

---

# Part 2 — What do we actually need to learn?

Every assumption the product currently makes. The pattern to notice: almost
every belief below rests on the same evidence — *one person built it and
liked it.* That is a hypothesis, not a finding.

| # | Assumption | Why we believe it | Evidence we have | Evidence missing | Confirms it | Falsifies it |
|---|---|---|---|---|---|---|
| A1 | **People will write regularly at all** | Journaling is an established habit | None outside the author | Any external retention data | ≥50% writing in week 4 | Median 2 entries total |
| A2 | **Echo is why people stay** | It is the product's differentiator and the strongest design in it | Design quality; no user reaction | Whether anyone notices it | Unprompted mention in interviews | People cannot recall seeing one |
| A3 | **People understand Camino** | The word was chosen with care | Vocabulary reasoning only | Whether anyone taps it | Users describe it correctly unprompted | "The one with the footprints? I never opened it" |
| A4 | **People want a weekly ritual** | It's a common reflective practice | None | Completion rate | ≥33% complete one by week 4 | <20% ever open it |
| A5 | **Practices belong in this product** | Retained deliberately after an argument to remove them | An argument, not data | Whether they're used or resented | ≥40% create one and still complete at week 8 | Created in week 1, abandoned by week 3 |
| A6 | **A daily intention is wanted** | It's the anchor of the Today screen | None | Whether it's filled or skipped | Used on >50% of active days | Consistently empty |
| A7 | **Search is sufficient retrieval** | It shipped and works well | Performance data only | Whether people find things | Users report finding something they half-remembered | Search used once, then never |
| A8 | **The 5-item nav is understandable** | It is small | None | First-run comprehension | Users predict what's behind each item | "I didn't know that screen existed" |
| A9 | **Atmospheres matter to users** | Extensive design investment | Contrast math; no user reaction | Whether anyone switches | Users change it and mention the room | Nobody leaves the default |
| A10 | **Silence causes no abandonment** | Seventh Law | None. **This is the riskiest assumption in the product** | Whether people simply forget SER exists | Return without prompting at week 8 | Users say "I forgot about it" |
| A11 | **Refusing to measure is felt as a benefit** | Constitutional conviction | None | Whether absence of feedback reads as care or emptiness | "It never made me feel behind" | "It never told me how I was doing" |
| A12 | **Writing is the primary act** | The product is built around composing | None | Read/write ratio | Balanced over time | 99% write, 1% read — the archive thesis fails |
| A13 | **People trust a solo-built app with intimate writing** | Local-first, export, no-read policy | Architecture only | Willingness to write the hard thing | "I wrote something here I haven't said aloud" | "I self-censor here" |
| A14 | **The free-text mood field is wanted** | It personalises over time | Vocabulary mechanism | Whether it's filled | Own vocabulary emerges by week 6 | Left blank consistently |
| A15 | **Direction is written** | It is where the product's motto yields to theirs | None | Whether anyone writes one | ≥25% write one | Nobody does — the footer motto never changes |
| A16 | **Life Areas are understood** | They predate the Constitution | None | Whether the concept lands | Used to set weekly focus | Created once, never referenced |
| A17 | **The daily reflection line is read** | It is the largest text on the screen | None | Whether it's read or scrolled past | Someone quotes one back | Nobody notices when it repeats |
| A18 | **Mobile PWA is the primary surface** | Design bias | None | Actual device split | Majority mobile installs | Everyone uses desktop browser |
| A19 | **Google-only sign-in is acceptable** | Simplicity | None | Whether it excludes anyone | No complaints | Users ask for email sign-in |
| A20 | **Export is valued** | Fourth Law | Implementation quality | Whether it's ever used | Used at least once by several users | Never used, never mentioned |
| A21 | **A 14-day echo wait is soon enough** | Reasoned in P0.2 | Reasoning only | Whether people last 14 days | ≥50% still active at day 14 | Median abandonment at day 5 |
| A22 | **One note per day is the typical shape** | Design shape | None | Actual distribution | Matches | People write 5 fragments daily, or one essay weekly |
| A23 | **Spanish-only fits the audience** | Product decision | None | Whether testers want another language | No requests | Immediate requests |
| A24 | **Not measuring means people won't ask to be measured** | Constitutional | None | Whether users request streaks | Nobody asks | Repeated requests for streaks — a real test of §8 |

**The three that matter most:** A10 (silence), A12 (does anyone read back), A2
(does Echo land). If all three fail, SER is a nicely built journal with an
unusual philosophy, and the strategy needs rewriting rather than adjusting.

---

# Part 3 — Design the Beta

### How many, and when

**Not 50 at once.** Three waves:

| Wave | Users | When | Purpose |
|---|---|---|---|
| **W0 — Private** | 5 | Week 0 | Catch the embarrassing. Real accounts, real writing, disposable relationship |
| **W1 — Core** | 15 | Week 2 | The learning cohort. Every one of these is interviewed personally |
| **W2 — Full** | 30 | Week 6 | Volume for retention signal, lighter contact |

Rationale: 50 simultaneous users on day one produces 50 identical reports of
the same first-run problem, and you can only make a first impression once.
Staging costs four weeks and buys two extra first impressions.

### Who should be invited

- **People who already journal** — on paper, in Notes, in Day One. We are
  testing whether SER is a better home for an existing habit, not whether it
  can create one. Habit creation is a different product and a much harder bet.
- **Spanish-first**, comfortable writing at length in Spanish.
- **Mobile-primary**, since that is the design bias and we need it tested.
- **A deliberate 20% who do not journal**, as a control on A1 — but their
  churn must never be read as a product failure.
- **At least three people who will be blunt.** Not friends. Not people who
  will protect the author's feelings.

### Who should NOT be invited

- **Friends and family who will be kind.** They generate false positives and
  they are the hardest to remove later.
- **Productivity enthusiasts.** They will ask for streaks, tags, and metrics,
  and the pressure will be constant and constitutionally corrosive.
- **Anyone in acute crisis.** SER is not therapy, has no safety net, no
  escalation path, and no crisis resources. Recruiting vulnerable people to
  test an unlaunched journal is an ethical problem, not a product one.
- **Anyone who would make SER their only copy** — until deletion and edit
  ship and have been exercised. Say this in the invitation.
- **Anyone who needs it in another language.**

### How long

**Twelve weeks.** Non-negotiable, and the number matters: the audit places
abandonment at month two to four. A four-week beta measures novelty. Twelve
weeks is the shortest window that can see the cliff.

### Cadence

| Contact | When | Form |
|---|---|---|
| Onboarding call | Day 0 | 15 min, watch them install and write once |
| Day 1 | Day 1 | 3 async questions |
| Week 1 | Day 7 | 20 min call |
| Weekly pulse | Every Friday | **One** question, async, never more |
| Month 1 | Day 30 | 30 min call |
| Month 3 | Day 84 | 45 min exit interview, whether or not they still use it |

**Interview the people who stop.** They hold the only information that
matters, and they are the least likely to volunteer it.

### The team's week

| Day | Activity |
|---|---|
| Monday | Read the week's feedback and pulse answers. No decisions |
| Tuesday | Decide what — if anything — the evidence supports. Record in the Ledger |
| Wed–Thu | Build only what Tuesday authorised |
| Friday | Ship, send the pulse question |
| Weekend | Nothing. The product is about not competing for attention; the team should model it |

**The rule that protects the beta:** no feature is built in the first four
weeks. Only blockers and bugs. Four weeks of pure listening, or the cohort
ends up testing our reflexes instead of the product.

---

# Part 4 — Product Analytics

The Constitution's G1 forbids anyone but the person reading what they wrote —
including us, including a model, including "anonymised." That is absolute and
it is not inconvenient; it is the product.

**The operating principle: record that something happened, never what was
said. Aggregate across people, never assemble a timeline of one. When
behaviour and self-report disagree, believe behaviour — but ask before you
infer.**

### Events worth recording

| Event | Payload | Why it matters |
|---|---|---|
| `app_opened` | date, coarse time bucket (morning/afternoon/evening), surface (PWA/browser) | A10 — do people return unprompted, and when |
| `note_written` | date only, count | A1, A22 — is the habit real |
| `intention_set` | date | A6 |
| `screen_viewed` | screen name | A3, A8 — is Camino ever reached |
| `echo_shown` | date, kind (anniversary/recollection) | A2 — delivery rate |
| `past_day_opened` | source (camino / search) | **A12 — the single most important event in this list** |
| `search_performed` | count only, **never the query** | A7 |
| `search_result_opened` | boolean | A7 — did search actually resolve anything |
| `weekly_review_completed` | week key | A4 |
| `practice_created` / `practice_completed` | count | A5 |
| `direction_saved` | count | A15 |
| `export_used` | count | A20 |
| `atmosphere_changed` | to which | A9 |
| `note_deleted` / `note_edited` | count | Trust — are people confident enough to correct |
| `account_deleted` | count | The most important trust signal there is |

### Events that must NEVER be recorded

- **Any writing.** Notes, intentions, directions, weekly reflections. Obvious.
- **Mood labels.** These are free text the person wrote. They are their words.
  Recording them is G1 whatever the schema says.
- **Search queries.** A query is a confession of what someone is looking for
  in their own life. This is the most tempting item on this list and the most
  clearly forbidden.
- **Note length, word counts, or writing duration.** Length becomes a metric
  that can fall the moment anyone looks at a trend, which is G2 arriving
  through the back door.
- **Precise timestamps** fine enough to reconstruct someone's daily routine.
- **Which echo was shown** beyond its kind. The identity of the memory is the
  memory.
- **Anything that would let us reconstruct one person's story.** If a query
  can produce "user 12's month," the schema is wrong.

### Metrics

**Retention** — the ones that decide whether SER continues.

| Metric | Definition | Threshold |
|---|---|---|
| Week-4 return | Wrote in week 4 | ≥50% |
| Week-12 return | Wrote in week 12 | **≥40% — the headline number** |
| Gap recovery | Returned after a 7+ day silence | ≥50% of gaps. Directly tests the Third and Seventh Laws |
| Write-days per active week | Median | Watched, never targeted |

**Trust** — the ones that decide whether SER *deserves* to continue.

| Metric | Why |
|---|---|
| Export used at least once | Do people believe the door is real |
| Notes edited or deleted after the fact | Confidence to correct is confidence to write honestly |
| Account deletions | Never optimise this down. A clean exit is a feature |
| Reported save failures | Must be zero |
| Self-censorship (interview-only) | The one trust metric that cannot be instrumented |

**Product health**

| Metric | Why |
|---|---|
| % of users who ever open a past day | **The thesis metric.** If this is low, the archive is decoration |
| Echo delivery rate | Is the mechanism firing at all |
| % of sessions containing a write | Is SER a place to write or a place to check |
| Screens never visited | Direct input to the delete list |

Everything above is opt-in at onboarding, explained in one sentence, and
declinable without losing access. A product that refuses to read your writing
should also be willing to be told no about counting your taps.

---

# Part 5 — User Interviews

Not usability tests. We are not asking whether they can find the button; we
are asking whether anything happened to them.

**Method notes:** never show them the screen while asking about memory —
recognition contaminates recall. Ask about last week, not "in general."
Silence is data; let it run.

### Day 1 — *did anything land?*

1. What did you think this was, before you opened it?
2. Walk me through what you did. Where did you hesitate?
3. Did you write something real, or did you test it?
4. Was there anything you thought about writing and decided not to?
5. What do you expect to happen tomorrow?

> **Worrying:** "I wasn't sure what to do." "I wrote a test entry." "I don't
> know what the other screens are for."
> **Exciting:** they wrote something true on day one. They ask when it will
> show them something back.

### Week 1 — *did it survive contact with a normal week?*

1. Which days did you open it? What was happening on the days you didn't?
2. Did you write anything you wouldn't put in your phone's Notes app?
3. Did anything the app said land, or did you scroll past it?
4. Have you looked at anything you wrote earlier?
5. If it disappeared tonight, what would you have lost?

> **Worrying:** "I opened it because you asked me to." "I skip the top part."
> "Nothing, really" to Q5.
> **Exciting:** an unprompted mention of the echo. A specific answer to Q5.

### Month 1 — *is it a habit or a favour?*

1. When did you last open it without thinking about this beta?
2. Has it shown you something of your own? What happened?
3. Have you ever gone looking for something you wrote? Did you find it?
4. What's become boring?
5. Has it ever made you feel behind, judged, or watched?
6. Have you told anyone about it? What did you say?

> **Worrying:** "It's the same every day." "I couldn't find it." Any yes to Q5.
> **Exciting:** their Q6 answer is a sentence we didn't write. A story for Q2.

### Month 3 — *the exit interview, for everyone*

1. Tell me about the last time you opened it.
2. What made you stop, or nearly stop? Be specific about the day.
3. What do you have now that you didn't three months ago?
4. Would you notice if it shut down tomorrow?
5. Would you pay for it? *(Not to price it — to test whether it's real.)*
6. What would you tell me to change if I could only change one thing?
7. Did you ever write something here you haven't said out loud?

> **Worrying:** Q4 is "no." Q3 is "not much." Q7 is a firm no across the cohort
> — that means SER is not trusted with the material it exists for.
> **Exciting:** Q3 is answered with a specific memory they'd otherwise have
> lost. Q7 is yes and they don't elaborate — that is exactly right.

---

# Part 6 — Success Criteria

Deliberately not downloads, signups, or sessions. The Constitution forbids
optimising for engagement, and the audit's real question is six-month use.

### Must happen — all of these, or SER does not continue in this form

1. **≥40% of activated users write something in week 12.**
2. **Zero data-loss incidents.** Not "few." Zero. One is disqualifying for a
   product whose promise is a ten-year archive.
3. **≥60% recall the echo unprompted**, and at least three describe a specific
   one. This validates A2, on which the strategy rests.
4. **Nobody reports self-censoring.** If people write less honestly here than
   in a paper notebook, the entire premise is dead regardless of retention.
5. **At least three people describe SER to someone else in their own words**,
   and the descriptions are recognisably the same product.

### Should happen

6. ≥40% open a past day at least once (A12).
7. ≥33% complete a weekly review by week 4 (A4).
8. ≥50% of 7-day gaps end in a return (A10).
9. At least two people write a Direction and see the footer change.
10. Export used by ≥25%, unprompted.

### Nice to happen

11. Someone asks for something from the parked list — the printed year,
    finding by question — without having been told it exists.
12. Someone changes atmosphere and talks about it as a room.
13. Someone asks to keep using it after the beta ends. This is the single
    best signal available and it cannot be engineered.

---

# Part 7 — Failure Criteria

Written now, while nothing is invested. Each is a commitment to delete, not a
prompt to reconsider.

| Idea | Kill or redesign when | Then |
|---|---|---|
| **Threads** | <30% of users ever open a past day by week 12 | **Delete permanently.** Threads is structure over an archive people do not visit. Recognition cannot be built on top of avoidance |
| **One writing surface** | No user reports container confusion unprompted in 12 weeks | **Already deleted.** This restates the condition under which it could ever return — three independent unprompted reports |
| **Camino** | <40% ever open it, or users cannot describe it | **Redesign, don't delete.** The archive is the thesis; if the door is wrong, replace the door. First move is calendar browse, not more content |
| **Practices** | <40% create one, or <20% still completing at week 8 | **Remove from the product.** The argument to keep practices was philosophical and made without users. If unused, the honest response is deletion, not the P1.5 redesign |
| **Weekly Review** | <20% complete one by week 4 | Demote out of navigation. Do not promote it to fix low usage |
| **Direction** | <25% write one | Keep — it is nearly free and its payoff is in year two — but never promote it |
| **Life Areas** | Not referenced by ≥50% of those who create one | Delete. Two abstractions doing one job, one of them unused |
| **The daily reflection line** | Users cannot recall a single one at month 1 | Delete the module rather than expand the pool. An unread line is interface weight |
| **Journal prompt / welcome modules** | — | **Already on the delete list.** Do not wait for evidence to remove text that never changes |
| **Echo** | ≥60% cannot recall one, or recall it as noise | **Stop the beta and reconsider the product.** This is not a feature failing. Echo *is* the thesis. If it does not land with people who already journal, SER's differentiation does not exist and the correct response is to rethink rather than iterate |
| **Silence / no notifications** | ≥50% of 7-day gaps never end | Do not add notifications — the Seventh Law forbids scheduled ones. Reconsider whether the product must be somewhere people already are |

---

# Part 8 — Decision Framework for Feature Requests

[DECISIONS.md](DECISIONS.md) already provides the machinery: four Gates that
end discussion, five Tests that require argument, four verdicts. It does not
need replacing. It needs three additions, because it was written for
proposals we generate and the beta generates proposals from other people.

### Addition 1 — G5, the observer test

Owed since the roadmap was written, and a beta is exactly when it gets
violated.

> **G5. Does it require observing the person rather than serving them?**
> Anything that records, infers, profiles, or reports on behaviour for our
> benefit rather than theirs. Including debugging. Including "just for the
> beta." If we would not show the person the record we are keeping, we may
> not keep it.

This gate governs Part 4 and every future analytics decision.

### Addition 2 — requests are problems, never specifications

**A user request is evidence of a problem and never a description of the
solution.** The mandatory translation, recorded before anything else:

| They asked for | The problem underneath | What the Gates then permit |
|---|---|---|
| "A streak counter" | "I lose the thread and want to know I'm keeping it" | G2 kills the counter. The problem is real and points at Camino |
| "Tags" | "I can't find anything" | G4 kills tags. The problem points at retrieval |
| "Reminders" | "I forget it exists" | G3 kills scheduled reminders. The problem points at A10 and may have no permissible answer |

Whoever brings a request to the room must state the problem, not the feature.
A request that cannot be restated as a problem is a preference, and
preferences do not enter the process.

### Addition 3 — the three-mention rule and the size budget

- **Three independent, unprompted mentions** before a request enters the
  process at all. Unprompted matters: asking "would you like tags?" produces
  yes and teaches us nothing. One loud user is not a signal, and in a
  50-person beta they will feel like one.
- **The interface may not grow during the beta.** T2 becomes arithmetic:
  every addition names the removal that pays for it, in the same commit. If
  nothing can be named, SER is larger forever and that must be said out loud
  and recorded.
- **Every beta-driven decision gets a Ledger entry**, including rejections,
  including the ones that felt obvious. The Ledger is how we find out in year
  two that we said no to the same real problem four times.

### The pressure to expect, and the answer

Beta users will ask for streaks, mood charts, reminders, and AI summaries —
because every other product has trained them to. All four are already
recorded as **Never** in DECISIONS.md, decided before anyone asked.

The failure mode is not saying yes. It is saying "no, because of our
philosophy," which is a refusal to engage. **The correct response is to take
the problem seriously and the proposed solution not at all.** Someone asking
for a streak is telling us they cannot feel their own continuity — which is
the First Law's exact concern, and evidence that Camino has failed. That is a
gift, arriving in the wrong wrapper.

---

# Part 9 — The First Year

Decision by decision.

### Q1 — Launch and shut up (months 1–3)

**Focus:** the four blockers, then twelve weeks of listening.
**Ignore:** every feature request. All of them. Log, translate, never build.
**Decision at the end of Q1:** do the Must-happen criteria hold? If ≥40%
week-12 retention and Echo lands, continue. If not, the strategy is wrong,
not the backlog.

**Biggest risk:** the author is the primary user and the most experienced
journal-keeper in the cohort. Every design instinct is calibrated on one
person who already knows where everything is. Weight outsiders' confusion
higher than it feels comfortable to.

### Q2 — Make the archive reachable (months 4–6)

The audit's highest-value finding, gated on Q1 showing people try to look
back and fail.

**Focus:** opening a day; calendar or month browse; the Q1 delete list.
**Ignore:** retrieval-by-question, threads, artifacts.
**Decision:** practices live or die (§7). Take it, and take it on the numbers
rather than on the argument that saved them last time.

**Biggest opportunity:** the read side is the least-built and highest-leverage
half of the product. Everything shipped so far optimises writing into SER.

### Q3 — Decide what SER is for (months 7–9)

By now there is a year of evidence about whether people return to their own
writing.

**If they do:** retrieval and return modes become the roadmap, in that order.
**If they don't:** SER is a beautifully made writing surface and should be
positioned as one. That is not failure — it is a different, smaller, entirely
honest product. Discovering it in month nine is cheap; discovering it in year
three, after building threads on top of it, is not.

**Ignore:** growth. 50 → 500 before the product knows what it is converts one
question into five hundred.

### Q4 — Sustainability and the audit (months 10–12)

**Focus:** the annual Constitution audit — required by the document itself and
the moment it either proves it has teeth or reveals itself as decoration. Then
the business question, which cannot be deferred past year one: a product
promising a ten-year archive that has no way to survive ten years is making a
promise it cannot keep. That is a Fifth Law problem, not a finance problem.
**Opportunity:** the printed year becomes buildable for the first time —
users have twelve months of writing. This is the strongest artifact in the
product and the first thing worth building purely because it is good.

### Standing risks

| Risk | Mitigation |
|---|---|
| **Bus factor of one** | Export already means nobody's archive dies with the project. Say this in the invitation |
| **Supabase dependency** | Local-first means the app survives an outage. A migration path is a year-two question |
| **Philosophy as an excuse** | The Constitution forbids metrics; it does not forbid usability. "That's philosophical" must never be the answer to "I couldn't find it" |
| **The cohort going quiet** | Silence from users is not consent. Interview the churned |
| **Building during the beta** | The four-week freeze exists for this |

---

## How to know SER is becoming what it was meant to be

Three questions, asked every quarter. They are not metrics and they should
never be turned into any.

1. **Is the ratio moving toward their words?** T4 made temporal. At launch,
   almost everything on Today is ours. If in month twelve it is still ours,
   the patina is not working, and it was the whole idea.
2. **Is the interface smaller than last quarter?** The sequencing principle
   survives from the old roadmap because it was always the right one. Growth
   in surfaces is the leading indicator of a product forgetting itself.
3. **When someone describes SER to a friend, do they describe what we built?**
   If they say "a journal app," we have made a journal app. If they say
   something we did not write, that is the product working.

The unmeasurable one, kept from the original roadmap because it is still the
real test: **in year ten, is the archive still true, still theirs, and still
legible?** Everything here is an attempt to make that answer yes, and to find
out much sooner than year ten whether anyone wants it to be.
