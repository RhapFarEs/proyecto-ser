# Language Guide

This document defines the voice of Proyecto SER: what it sounds like, what it never sounds like, and why. It extends `VOCABULARY.md`'s word table into a full writing reference — every button label, placeholder, empty state, prompt, and (eventually) notification should be checked against this document before it ships.

If a rule here ever conflicts with a rule in `PRODUCT_PRINCIPLES.md` or `MANIFESTO.md`, those win — language serves the product's philosophy, not the other way around.

## The voice, in one sentence

Proyecto SER talks the way a calm, honest friend would talk about your day — never the way an app talks about your metrics.

## Language and register

- **All user-facing copy is Spanish.** Code, comments, file names, and documentation (including this file) are English. Never mix the two in what the user sees.
- **Always `tú`, never `usted`.** Proyecto SER is close, not formal. Compare the copy already shipped: *"Escribe con honestidad"*, *"Elige algo pequeño y sostenible"*, *"¿Cómo llegas hoy?"* — every instruction and question already addresses the user directly and informally. A stray `usted` would read as the app suddenly stepping back from the person.
- **Second person, active voice.** Never *"El usuario debe completar su intención"* — always *"Escribe tu intención para hoy."* Third person turns the user into a case study of themselves.
- **Sentence case, always.** Titles, subtitles, and labels capitalize only the first word (and proper nouns) — never Title Case. This is not a stylistic preference; Title Case reads as corporate/software-brochure voice, the opposite of the "close, human" tone `VOCABULARY.md` asks for. (This was a real bug, not just a rule: `Page.tsx` and `GreetingModule.tsx` once forced every word capitalized via a CSS `capitalize` class over already-correct sentence-case strings — fixed by removing it. Sentence case must be true both in the source string and in however it's rendered.)

## Vocabulary

The canonical word-substitution table lives in `VOCABULARY.md` — this section restates it and extends it with the domain nouns introduced since.

| Avoid | Prefer | Why |
|---|---|---|
| Dashboard | Today (Hoy) | Names the present, not a control panel. |
| Routine (Rutina) | Ritual | Rutina describes repetition; Ritual describes intention held across the repetition. |
| Goal (Meta) | Intention (Intención) | A goal is a target to hit or miss. An intention is a stance to hold — it doesn't fail. |
| Checklist | Ritual / Practice (Práctica) | A checklist is a list of obligations. A ritual is a practice with meaning. |
| Productivity | Progress (Progreso) | Progress admits nonlinearity; productivity implies constant output. |
| Streak (Racha) | Path (Camino) | A streak is a number that can break. A path is a direction that's always still there. |
| Task (Tarea) | Practice (Práctica) / Note (Nota) | Tasks get "done." Practices get sustained; notes get written — neither is completed and discarded. |
| Category (Categoría) | Life Area (Área de vida) | A category sorts things. A Life Area is something a person cares about — it deserves a name that admits that. |
| Dashboard widget / metric | (none — doesn't exist here) | There is no vocabulary for this because there is no concept for it. |

Domain nouns should always be written exactly as established, never re-synonymized per screen: **Hoy**, **Ritual**, **Hábito**, **Intención**, **Diario**, **Nota**, **Revisión semanal**, **Área de vida**, **Dirección personal**, **Cierre del día**. Consistency here is what lets a returning user recognize a concept instantly instead of re-parsing new wording every time.

## Preferred words

Words that show up often because they carry the product's stance in a single syllable:

- **Sostener / sostuviste** — the verb this product uses instead of "complete" or "finish." *"Hoy ya sostuviste: Meditar."* Sostener (to sustain, to hold up) implies an ongoing act of care, not a checkbox ticked off a list. It's also gentler in the negative: nothing is ever "not sustained," it's simply not mentioned.
- **Guardar / Guardado** — the only word used for persisting something the user wrote. Never "enviar" (submit, implies handing something off to be judged), never "publicar."
- **Cuidar / cuidar de** — used for what a Life Area or a habit is *for* (*"¿Para qué quieres sostener este hábito?"*), reinforcing that the product exists to help someone care for things, not manage them.
- **Calma / con calma / sin prisa** — appears in nearly every placeholder (*"Escribe con calma, sin prisa."*) as a standing reminder that speed is never the point.
- **Cierre / cerrar** — for ending something intentionally (a day, a week) — never "finalizar," which reads as a process completing, not a person choosing to stop.

## Forbidden words

These are not stylistic preferences — each one either implies scoring, implies failure, or borrows the voice of a gamified productivity app. None of them should ever appear in Proyecto SER copy, regardless of context:

| Forbidden | Why |
|---|---|
| Racha (streak), racha rota | Implies a number that can break — the exact "don't break the chain" pressure the product exists to avoid. |
| Puntuación, puntos, score | There is no scoring system. Introducing the word invites the concept. |
| Porcentaje, tasa de finalización, "X de Y" counts | A completion rate is analytics. This is a reflection tool — see `REVIEW_EXPERIENCE.md`. |
| Fallaste, perdiste, te faltó, incompleto | No day, habit, or intention "fails." Absence is silence, never a marked failure. |
| Debes, tienes que, obligatorio | Commands create obligation. Every instruction should read as an invitation the user can decline without consequence (see Rule 9, `PRODUCT_PRINCIPLES.md`: "the user owns the experience"). |
| ¡Felicidades!, ¡Genial!, ¡Lo lograste! (and exclamation-heavy praise generally) | Cheerleading implies the app is grading the user's performance. Acknowledgment in this product is quiet (see Encouragement tone, below). |
| Productividad, rendimiento, eficiencia | These are the words of the app Proyecto SER explicitly says it is not (`PROJECT.md`: "It is not a productivity dashboard"). |
| Desbloqueaste, logro, insignia, nivel | Gamification vocabulary — achievements, unlocks, badges, levels. None of these concepts exist in the domain model and the words shouldn't either. |
| Mejor que ayer / tu mejor semana / récord personal | Any phrase that compares the present to a past version of the user for the purpose of ranking it. |
| Recordatorio pendiente, sin leer, notificación no vista | Debt-framing language for anything the user hasn't engaged with yet — see Notification tone. |

## Writing principles

1. **Short sentences.** Copy is read in passing, on a phone, often at the end of a tiring day. If a sentence needs a comma to hold two ideas, it's probably two sentences.
2. **No jargon, no app-speak.** Never "sync," "workflow," "input," "session." Say what a person would actually say: "escribe," "guarda," "revisa."
3. **Undercut perfectionism on purpose.** Existing copy already does this deliberately — *"No necesitas encontrar las palabras perfectas. Solo empieza por las verdaderas."* and *"No busques la respuesta perfecta. Solo responde con honestidad."* Any prompt that could make someone hesitate before writing should be paired with a line giving them permission not to get it right.
4. **Prefer permission over instruction.** *"Puedes dejarlo así por ahora"* (Dirección personal's placeholder) does more work than a bare instruction — it explicitly tells the user that stopping is allowed.
5. **Default to no exclamation points.** Calm is a design material here as much as whitespace is (`DESIGN_SYSTEM.md`: "Silence is a feature"). Reserve emphasis for rare, genuinely warm moments — never for routine confirmations.
6. **Present tense, concrete, sensory over abstract.** *"¿Cómo llegas hoy?"* not *"Evalúa tu estado emocional actual."*
7. **Never explain the app to itself.** Copy should never describe what a button does mechanically ("Presiona aquí para guardar tu entrada en la base de datos") — only what it means to the person ("Guardar").

## UI copy principles

- **Buttons**: one to three words, verb-first, no punctuation. `Guardar`, `Guardar nota`, `Guardar intención`, `Editar`, `Archivar`, `Activar`, `Cancelar`, `Marcar en foco`. Never a full sentence, never an exclamation mark, never "¡Guarda ya!"
- **Section titles**: plain noun phrases naming the concept, not commands. `Cierre del día`, `Intención del día`, `Reflexión semanal`, `Área que quiero cuidar esta semana` — never "¡Cierra tu día!"
- **Placeholders**: an invitation plus permission, almost always including a phrase that lowers the stakes. `"Escribe con calma. Puedes dejarlo así por ahora."`, `"Sin prisa, sin juicio."`, `"Una intención, no una lista de tareas."`
- **Empty states**: warm, never a void and never a nag. `"Aún no tienes hábitos. Crea el primero cuando sientas que es el momento."` — note "cuando sientas que es el momento" sets no deadline and implies no urgency. An empty state is never phrased as something missing that should be fixed.
- **Saved-state confirmations**: one quiet word. `Guardado.` No toast, no animation implied by the copy, no "¡Guardado exitosamente!" The confirmation's calmness is itself the message: nothing dramatic needs to happen when the app simply does what it was asked.
- **Disabled/incomplete states**: silence, not scolding. A save button stays quietly disabled when there's nothing to save — it never shows a red error explaining why.

## Notification tone

No notification system exists yet, but the day one is designed, it inherits every constraint above plus these, because a notification is the one surface that reaches the user *without being asked to*:

- **Never reference absence.** No *"No has escrito hoy"*, no *"Han pasado 3 días desde tu última nota."* A notification names an opportunity in the present, never a debt from the past. Compare the forbidden framing to an acceptable one: not *"No has escrito hoy"* but *"Un espacio para ti esta noche, si lo quieres."*
- **Never imply urgency or an unread count.** No badge language, no "pendiente," no red dot vocabulary. The product should never make the user feel behind on their own reflection.
- **Always optional in tone, even if the user can't easily silence it yet.** Every notification should read as something the user is invited into, with an implicit "if you want to" — matching Rule 9 (`PRODUCT_PRINCIPLES.md`): the app guides, it never controls.
- **No streak-preservation language.** The most common notification pattern in habit apps — "don't lose your streak!" — is doubly forbidden here: it's both a forbidden word (racha) and a forbidden emotional lever (loss aversion).

## Reflection tone

Reflection prompts are the closest thing this product has to "asking a question," so they carry the most responsibility for feeling like a person, not a form:

- **Ask open questions with no correct answer.** *"¿Qué ocupa más espacio en tu mente hoy?"*, *"¿Qué estuvo bien esta semana?"*, *"¿Qué fue difícil o quiero comprender mejor?"* — each is unanswerable "wrong."
- **Never diagnostic.** Not *"¿Completaste tus objetivos hoy?"* (evaluates output) but *"¿Cómo viviste este día?"* (asks about experience). The product measures nothing it asks about.
- **Prompts introduce themselves gently before asking.** *"No busques la respuesta perfecta. Solo responde con honestidad."* precedes the question itself — permission comes before the ask, not after.
- **Singular focus.** One prompt at a time (`JOURNAL_SPEC.md`'s original MVP: "Offer one meaningful question. Only one.") — reflection tone is undermined by a wall of questions that turns writing into a form to fill out.

## Encouragement tone

Encouragement in this product is **acknowledgment, not praise** — it states a true, specific fact about what the person did, and stops there.

- **State the fact, don't grade it.** *"Hoy ya sostuviste: Meditar."* is encouragement. *"¡Bien hecho completando tu meditación!"* is not — the second one implies a standard was met, the first just says something true.
- **Never compare.** Not to yesterday, not to "your best week," not to other users (there are no other users visible to each other in this product, and copy should never imply there could be).
- **Never reward.** No unlocks, no badges, no "you've earned..." framing — see Forbidden words.
- **The absence of encouragement is not a problem to fix.** `DailyInsightsModule`'s own rule — show at most one calm insight, or nothing at all — is itself a tone decision: an empty day gets silence, not a manufactured "you can do it!" nudge. Encouragement that appears on a schedule regardless of whether there's anything true to say stops being honest.

## Worked examples

| Situation | Wrong (forbidden voice) | Right (Proyecto SER voice) |
|---|---|---|
| Habit completed today | "¡Racha de 5 días! 🔥" | "Hoy ya sostuviste Meditar." |
| Nothing done yet today | "¡Aún no has completado nada hoy!" | *(nothing shown at all)* |
| Weekly summary | "Completaste el 71% de tus hábitos esta semana." | "Sostuviste: Meditar, Beber agua." |
| Save confirmation | "¡Guardado exitosamente! ✅" | "Guardado." |
| Empty habit list | "No tienes hábitos configurados." | "Aún no tienes hábitos. Crea el primero cuando sientas que es el momento." |
| Reflection prompt | "Evalúa del 1 al 10 cómo fue tu día." | "¿Cómo viviste este día?" |
| Reminder notification | "⏰ ¡No olvides escribir en tu diario!" | "Un espacio para ti esta noche, si lo quieres." |
| Archived habit label | "Hábito inactivo — 0% esta semana" | *(shown once, quietly, in an "Archivadas" section, no metric attached)* |

## Checklist for new copy

Before shipping any new string, run it through these questions:

1. Could this sentence make someone feel behind, late, or graded? If yes, rewrite it as a fact or an invitation instead.
2. Does it use a forbidden word, even disguised (a percentage without the `%` sign is still a percentage)?
3. Is it in `tú`, sentence case, active voice, short?
4. If it's a prompt, is there a genuinely honest answer that would make the person feel judged? If yes, soften or reframe the question.
5. If it's an empty or negative state, does it read as silence/invitation, or as a void/scolding?
6. Would a calm, honest friend actually say this to you about your own day?

If the answer to #6 is no, it doesn't ship.
