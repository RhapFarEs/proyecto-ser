import { ALL_WEEKDAYS, type Weekday } from "./habit";

export type HabitSuggestionCategory = "Cuerpo" | "Mente" | "Relaciones" | "Espíritu" | "Orden";

/**
 * A starting point, not a domain object — it has no id, no timestamps, no
 * active/deleted state, because it isn't a Habit yet. Selecting one only
 * pre-fills `HabitFormModule`; the actual `Habit` is created the normal way
 * (via `createHabit`) once the user saves, so a suggestion-based habit is
 * indistinguishable from a hand-typed one the moment it's saved.
 *
 * Deliberately no duration or quantity in any `purpose` here ("10 minutos",
 * "2 litros") — frequency and amount are the user's call, never suggested.
 */
export interface HabitSuggestion {
  title: string;
  purpose: string;
  weekdays: Weekday[];
  category: HabitSuggestionCategory;
}

const WEEKDAYS_ONLY: Weekday[] = [1, 2, 3, 4, 5];
const WEEKEND: Weekday[] = [6, 0];

export const HABIT_SUGGESTIONS: HabitSuggestion[] = [
  // Cuerpo
  {
    title: "Entrenar",
    purpose: "Para cuidar tu cuerpo con constancia.",
    weekdays: [1, 3, 5],
    category: "Cuerpo",
  },
  {
    title: "Caminar",
    purpose: "Para moverte y despejar la mente.",
    weekdays: ALL_WEEKDAYS,
    category: "Cuerpo",
  },
  {
    title: "Tomar agua",
    purpose: "Para cuidar lo más básico de tu cuerpo.",
    weekdays: ALL_WEEKDAYS,
    category: "Cuerpo",
  },
  {
    title: "Dormir bien",
    purpose: "Para darle a tu cuerpo el descanso que necesita.",
    weekdays: ALL_WEEKDAYS,
    category: "Cuerpo",
  },
  {
    title: "Estirar",
    purpose: "Para soltar la tensión que acumulas en el día.",
    weekdays: ALL_WEEKDAYS,
    category: "Cuerpo",
  },

  // Mente
  {
    title: "Leer",
    purpose: "Para alimentar tu mente con algo distinto.",
    weekdays: ALL_WEEKDAYS,
    category: "Mente",
  },
  {
    title: "Meditar",
    purpose: "Para encontrar un momento de calma en el día.",
    weekdays: WEEKDAYS_ONLY,
    category: "Mente",
  },
  {
    title: "Escribir en mi diario",
    purpose: "Para poner en palabras lo que llevas dentro.",
    weekdays: ALL_WEEKDAYS,
    category: "Mente",
  },
  {
    title: "Aprender algo nuevo",
    purpose: "Para mantener viva tu curiosidad.",
    weekdays: [2, 4],
    category: "Mente",
  },
  {
    title: "Escuchar un podcast",
    purpose: "Para acompañar tu día con algo que te aporte.",
    weekdays: ALL_WEEKDAYS,
    category: "Mente",
  },

  // Relaciones
  {
    title: "Hablar con mis papás",
    purpose: "Para mantener cerca a quienes te formaron.",
    weekdays: [0],
    category: "Relaciones",
  },
  {
    title: "Llamar a un amigo",
    purpose: "Para no dejar que la distancia crezca.",
    weekdays: [3],
    category: "Relaciones",
  },
  {
    title: "Agradecer a alguien",
    purpose: "Para no dar por hecho a las personas que te acompañan.",
    weekdays: [5],
    category: "Relaciones",
  },
  {
    title: "Escribir un mensaje importante",
    purpose: "Para decir lo que a veces dejas para después.",
    weekdays: [4],
    category: "Relaciones",
  },
  {
    title: "Tener una conversación sin celular",
    purpose: "Para estar realmente presente con quienes te rodean.",
    weekdays: WEEKEND,
    category: "Relaciones",
  },

  // Espíritu — universal on purpose: each suggestion here should make sense
  // to someone of any faith and to someone of none (PRODUCT mandate:
  // spirituality without assuming a specific belief system).
  {
    title: "Orar o meditar",
    purpose: "Para volver a lo que sostiene tu día.",
    weekdays: ALL_WEEKDAYS,
    category: "Espíritu",
  },
  {
    title: "Leer algo que te inspire",
    purpose: "Para nutrir tu interior con calma.",
    weekdays: ALL_WEEKDAYS,
    category: "Espíritu",
  },
  {
    title: "Dar gracias",
    purpose: "Para reconocer lo que ya tienes.",
    weekdays: ALL_WEEKDAYS,
    category: "Espíritu",
  },
  {
    title: "Reflexionar",
    purpose: "Para cerrar el día con más conciencia.",
    weekdays: ALL_WEEKDAYS,
    category: "Espíritu",
  },
  {
    title: "Estar en silencio",
    purpose: "Para escuchar lo que normalmente el ruido no te deja oír.",
    weekdays: ALL_WEEKDAYS,
    category: "Espíritu",
  },

  // Orden
  {
    title: "Tender mi cama",
    purpose: "Para empezar el día con un pequeño acto de orden.",
    weekdays: ALL_WEEKDAYS,
    category: "Orden",
  },
  {
    title: "Ordenar mi espacio",
    purpose: "Para que tu alrededor refleje algo de calma.",
    weekdays: [0],
    category: "Orden",
  },
  {
    title: "Planear mi día",
    purpose: "Para empezar con más claridad, no con más presión.",
    weekdays: WEEKDAYS_ONLY,
    category: "Orden",
  },
  {
    title: "Preparar mañana",
    purpose: "Para llegar al día siguiente con menos prisa.",
    weekdays: WEEKDAYS_ONLY,
    category: "Orden",
  },
  {
    title: "Revisar pendientes",
    purpose: "Para tener claridad sobre lo que tienes por delante.",
    weekdays: [0],
    category: "Orden",
  },
];
