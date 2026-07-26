# BACKLOG

> Prioritized work list for Proyecto SER.
>
> It contains only pending or in-progress tasks.
> When a task is completed, it is removed from this document.

---

## Next

### Experience

- [ ] Notification/reminder system (design constraints already written in
      `LANGUAGE_GUIDE.md` § Notification tone — never reference absence, never
      imply urgency, no streak-preservation language).
- [ ] Monthly reflection, as a calmer counterpart to Revisión semanal
      (`ROADMAP.md` M5 lists it; only the weekly review exists today).
- [ ] Accessibility pass: focus-visible states on every interactive element,
      `aria-live` on save confirmations, keyboard-only walkthrough of each screen.

### Product

- [ ] Data export ("everything you've written, as a file you keep") — a trust
      feature for a product that holds someone's private reflections.
- [ ] Account deletion from inside the app, not just the dashboard.

### Technical

- [ ] Automated tests. There is currently no test suite at all; the highest-value
      first targets are the pure domain functions (`lib/date.ts`,
      `insight-engine.ts`, `daily-reflections.ts`, each domain's migrations).
- [ ] Real app versioning. `APP_VERSION` in `lib/domain/feedback/feedback-context.ts`
      is still bumped by hand.
- [ ] Retire the legacy compatibility fields on `Day` (`journal`, `rituals`) once
      no stored record still relies on them — everything reads `entries` now.

---

## Future

### AI companion

- [ ] Personalized reflections drawn from what the person has actually written.
- [ ] Pattern recognition across weeks (gentle observations, never diagnoses).
- [ ] Recommendations that stay invitations, never instructions.

Constraint for all three: whatever ships must preserve privacy and must never
grade, score, or compare the person. A deterministic, local, on-device
implementation is preferred over sending private reflections to a third party;
if a model is ever involved, it must be an explicit, revocable opt-in.

### Progress

- [ ] A longer-range view of the journey (months, seasons) that still refuses
      counts and percentages.
