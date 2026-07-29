import { getLocalDateKey, parseLocalDateKey } from "@/lib/date";

/**
 * The daily reflection shown at the top of Today. Original lines written in
 * the product's own voice (LANGUAGE_GUIDE.md) — no quoted authors, so the
 * "· Proyecto SER ·" attribution under it stays honest. Universally human
 * on purpose: no line assumes a faith, a belief system, or a productivity
 * mindset. Each one should read like something a calm friend might say.
 *
 * Selection is deterministic per calendar day (see getDailyReflection):
 * everyone sees the same line on the same date, it never changes on
 * reload, and no network or randomness is involved.
 */
const DAILY_REFLECTIONS: string[] = [
  "No necesito tener toda mi vida resuelta para vivir un buen día.",
  "Hoy puedo empezar de nuevo, sin cargar todo lo de ayer.",
  "Lo pequeño, sostenido en el tiempo, se vuelve grande.",
  "Puedo hacer una sola cosa a la vez. Eso es suficiente.",
  "La calma no llega cuando todo se resuelve. Llega cuando dejo de exigirme resolverlo todo hoy.",
  "Mi valor no depende de lo que produzca hoy.",
  "Un día vivido con atención vale más que uno vivido de prisa.",
  "Puedo estar en paz y en proceso al mismo tiempo.",
  "No llegué tarde a mi propia vida. Estoy exactamente donde puedo empezar.",
  "Descansar también es una forma de cuidar lo que importa.",
  "Hoy no tengo que ser mejor que nadie. Solo estar presente.",
  "Las cosas importantes crecen despacio.",
  "Puedo soltar lo que no depende de mí.",
  "Ser honesto conmigo es el primer acto de cuidado.",
  "No todo lo que siento hoy es permanente.",
  "La constancia amable llega más lejos que la exigencia dura.",
  "Hoy puedo elegir una cosa que sí está en mis manos.",
  "El silencio también me habla, si me detengo a escucharlo.",
  "Agradecer no niega lo difícil. Lo pone en compañía.",
  "Mi camino no tiene que parecerse al de nadie más.",
  "Puedo empezar mal y terminar bien el mismo día.",
  "Lo que evito nombrar pesa más que lo que me atrevo a escribir.",
  "Cuidarme no es egoísmo. Es lo que hace posible cuidar lo demás.",
  "Hoy es un buen día para hacer las paces con lo inacabado.",
  "No necesito sentirme motivado para dar un paso pequeño.",
  "La presencia vale más que la perfección.",
  "Puedo mirar mi día con curiosidad en lugar de juicio.",
  "Lo que hago con amor, aunque sea poco, deja huella.",
  "Cada día trae su propia oportunidad de volver a empezar.",
  "Estar cansado no significa estar fallando.",
  "Puedo pedir ayuda. Eso también es fortaleza.",
  "Una intención clara ordena más que una lista larga.",
  "Lo que sostengo hoy me sostiene mañana.",
  "No tengo que entenderlo todo para seguir caminando.",
  "La comparación me quita lo que la gratitud me devuelve.",
  "Hoy puedo darle espacio a algo que me haga bien.",
  "El día no se mide por lo que tacho, sino por cómo lo habito.",
  "Puedo perdonarme lo de ayer y aun así aprender de ello.",
  "Hay tiempo para lo que de verdad importa.",
  "Volver a intentarlo también cuenta.",
  "Mi respiración siempre está aquí para traerme de vuelta.",
  "Un momento de quietud puede cambiar el tono de todo el día.",
];

export interface DailyReflection {
  text: string;
  /** True when the line came from the person rather than from the collection above. */
  isOwn: boolean;
}

/**
 * Long enough to be a thought, short enough to hold at display size. The
 * floor is what keeps "Entrenar" out of a slot meant for a sentence.
 */
const OWN_LINE_MIN_LENGTH = 30;
const OWN_LINE_MAX_LENGTH = 190;

/**
 * Days before something a person wrote is eligible to come back as a line
 * for today. Below this it is still what they said recently, not something
 * they once wrote — and the difference is the whole effect.
 *
 * Lowered from sixty. Two months meant the patina could not begin until well
 * after most people had decided whether this product was for them, and there
 * is no reason the threshold should be longer than the one Echo uses for the
 * same judgment about forgetting.
 *
 * The visible effect early is small by design, and that is not a defect. One
 * eligible line sits in a pool with forty-two written by the product, so a
 * young installation still speaks almost entirely in the product's voice.
 * Biasing the pool to force someone's own words forward sooner would invert
 * the thing this system exists to do slowly.
 */
const OWN_LINE_MIN_AGE_DAYS = 14;

/**
 * Filters a person's own writing down to what can stand in this slot.
 *
 * This is the margin of the book. The forty-two lines above were written by
 * the product; everything this returns was written by whoever is reading
 * it, and both go into the same pool. Nobody configures this and nobody
 * chooses which line lands on which morning — it happens because a person
 * kept writing, which is the only way an object earns the marks that make
 * it theirs.
 *
 * The pool grows only in one direction, so the arithmetic does the aging by
 * itself: a new installation is entirely the product's voice, a first year
 * is mostly the product's voice with the person's showing through, and after
 * five years of writing the line at the top of the screen is more often
 * theirs than ours. Two people who never change a setting end up with
 * different products.
 */
export function selectOwnReflectionLines(
  written: { dateKey: string; text: string }[],
  todayKey: string = getLocalDateKey(),
): string[] {
  const today = parseLocalDateKey(todayKey).getTime();

  return written
    .filter((entry) => {
      const text = entry.text.trim();
      const ageInDays = (today - parseLocalDateKey(entry.dateKey).getTime()) / 86_400_000;

      return (
        text.length >= OWN_LINE_MIN_LENGTH &&
        text.length <= OWN_LINE_MAX_LENGTH &&
        ageInDays >= OWN_LINE_MIN_AGE_DAYS
      );
    })
    .map((entry) => entry.text.trim())
    // Stable order regardless of how storage happened to return them, so the
    // deterministic pick below stays deterministic across reloads.
    .sort((left, right) => left.localeCompare(right));
}

/**
 * Day-granular deterministic pick: the date key's components are folded
 * into an index so consecutive days move through the pool without repeating
 * until the whole thing cycles. Pure — same key and same pool, same line.
 */
export function getDailyReflection(
  dateKey: string = getLocalDateKey(),
  ownLines: string[] = [],
): DailyReflection {
  const pool = [...DAILY_REFLECTIONS, ...ownLines];
  const date = parseLocalDateKey(dateKey);
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  const index = (date.getFullYear() + dayOfYear) % pool.length;

  return {
    text: pool[index],
    isOwn: index >= DAILY_REFLECTIONS.length,
  };
}
