/**
 * An atmosphere does not change the room. It changes the light in it.
 *
 * Every atmosphere shares the same skeleton — the same typographic rule
 * (serif for what a person wrote, sans for what the app says), the same
 * spacing, the same motion, the same corners. Only the light differs: the
 * temperature and value of the ground, how a surface separates from it, and
 * the weight the ink needs to carry. The same room at a different hour.
 *
 * Two ship. Eight more are designed and deliberately unbuilt: ten
 * atmospheres would turn an identity into a settings screen, which is the
 * opposite of what this product is for. The ones here are the same idea in
 * both polarities — ink on paper — and between them they prove the whole
 * system, because if the architecture survives a full inversion it survives
 * anything milder.
 */
export type AtmosphereId = "tinta" | "papel" | "piedra";

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
];

export const DEFAULT_ATMOSPHERE: AtmosphereId = "tinta";

/**
 * Each atmosphere's ground, for the mobile browser chrome only — the real
 * values live in `globals.css`. Duplicated on purpose and kept in sync by
 * hand, because the pre-paint script in `app/layout.tsx` needs the same map
 * before any stylesheet or module has loaded.
 */
export const ATMOSPHERE_GROUND: Record<AtmosphereId, string> = {
  tinta: "#0c0a09",
  papel: "#f5f2ec",
  piedra: "#e9e8e5",
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
