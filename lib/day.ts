import type { Day } from "./models/Day";

export function getCurrentDay(): Day {
  return {
    reflection: "No necesito tener toda mi vida resuelta para vivir un buen día.",

    intention: "Vivir bien el día de hoy.",

    ritual: {
      name: "Ritual de la mañana",

      activities: [
        "Meditación",
        "Leer 15 minutos",
        "Entrenamiento",
        "Tomar 3 litros de agua",
        "Inventario nocturno",
      ],
    },
  };
}