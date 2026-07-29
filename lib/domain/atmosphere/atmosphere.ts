/**
 * An atmosphere does not change the room. It changes the light in it.
 *
 * Every atmosphere shares the same skeleton — the same typographic rule
 * (serif for what a person wrote, sans for what the app says), the same
 * spacing, the same motion, the same corners. Only the light differs: the
 * temperature and value of the ground, how a surface separates from it, and
 * the weight the ink needs to carry. The same room at a different hour.
 *
 * Five ship. Five more are designed and deliberately unbuilt, because each
 * of those was a variation of tone on a place already here — a warmer dark,
 * a cooler light — and a variation of tone is a theme. The bar for existing
 * is a moment that none of the others can hold: Tinta is a desk at night,
 * Papel a notebook by a window, Piedra a room you look at from a distance,
 * Alba an hour before the house wakes, Carbón the refusal to have a
 * temperature at all. Ten atmospheres would have turned an identity into a
 * settings screen, which is the opposite of what this product is for.
 *
 * Between them they still prove the whole architecture, because Tinta and
 * Papel are the same idea in both polarities — ink on paper — and a system
 * that survives a full inversion survives anything milder.
 */
export type AtmosphereId = "tinta" | "papel" | "piedra" | "alba" | "carbon";

export interface Atmosphere {
  id: AtmosphereId;
  name: string;
  /** What the place is, in one line. Chosen by what it's for, never by a colour swatch. */
  description: string;
}

export const ATMOSPHERES: Atmosphere[] = [
  {
    id: "tinta",
    name: "Tinta",
    description: "Una lámpara sobre un escritorio de noche.",
  },
  {
    id: "papel",
    name: "Papel",
    description: "Un cuaderno abierto junto a una ventana.",
  },
  {
    id: "piedra",
    name: "Piedra",
    description: "Una sala de museo, para mirar con distancia.",
  },
  {
    id: "alba",
    name: "Alba",
    description: "La casa antes de que despierte.",
  },
  {
    id: "carbon",
    name: "Carbón",
    description: "Una galería vacía de noche. Solo el texto.",
  },
];

export const DEFAULT_ATMOSPHERE: AtmosphereId = "tinta";

/**
 * Which room to open in before anyone has chosen one.
 *
 * The first frame is the one moment this product knows nothing about the
 * person in front of it — so it asks the only thing it can: whether their
 * device is set to light or dark. Opening a laptop in light mode into a
 * near-black screen is a bad first impression, and it was the previous
 * behaviour for every new visitor.
 *
 * This is a fallback, never an override. A stored choice always wins, and
 * the moment someone picks a room the system stops being consulted — they
 * have said what they want, and a preference expressed inside the product
 * outranks one expressed to the operating system.
 */
export const SYSTEM_LIGHT_ATMOSPHERE: AtmosphereId = "papel";
export const SYSTEM_DARK_ATMOSPHERE: AtmosphereId = "tinta";

/**
 * Each atmosphere's ground, for the mobile browser chrome — the real values
 * live in `globals.css`, and these mirror them because the pre-paint script
 * in `app/layout.tsx` needs the map before any stylesheet has loaded.
 *
 * This is the one place they are written down. The layout serializes this
 * object into that script and `useAtmosphere` reads it when switching, so
 * adding an atmosphere here is enough; the `Record` makes a missing entry a
 * type error rather than a wrong first frame.
 */
export const ATMOSPHERE_GROUND: Record<AtmosphereId, string> = {
  tinta: "#0c0a09",
  papel: "#f5f2ec",
  piedra: "#e9e8e5",
  alba: "#14100f",
  carbon: "#0a0a0a",
};

/**
 * Deliberately not namespaced by user and deliberately not cloud-synced.
 * Which light someone wants to read in belongs to the room they are sitting
 * in and the eyes they are reading with — it travels with the device, not
 * with the account.
 */
export const ATMOSPHERE_STORAGE_KEY = "ser.atmosphere";

export function isAtmosphereId(value: unknown): value is AtmosphereId {
  return ATMOSPHERES.some((atmosphere) => atmosphere.id === value);
}

/**
 * The atmosphere actually on screen right now, for stamping onto whatever
 * the person is writing.
 *
 * Reads the `<html>` attribute rather than localStorage on purpose: the
 * attribute is what the person can actually see, and it is already correct
 * in the case storage is not — someone who has never chosen a room is shown
 * one resolved from their device, and that is still where they were.
 *
 * Returns null off the browser and for ids this build does not recognize,
 * because a revision with no atmosphere is honest while a guessed one is
 * not.
 *
 * ---
 *
 * An atmosphere id, once written into the archive, is permanent vocabulary.
 * Rows recorded years ago name the room a person chose to sit in, so an id
 * may be *refined* — Papel's ink was darkened to clear AA, and it remained
 * the same room — but it may never be reused for a different place, and a
 * retired one may never be reassigned. This is the same discipline as never
 * reusing a value in a wire protocol, and it is the one decision here that
 * real data makes irreversible.
 */
export function readActiveAtmosphere(): AtmosphereId | null {
  if (typeof document === "undefined") {
    return null;
  }

  const applied = document.documentElement.dataset.atmosphere;

  return isAtmosphereId(applied) ? applied : null;
}
