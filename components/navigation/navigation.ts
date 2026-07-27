import {
  House,
  BookOpen,
  Target,
  ChartColumn,
  Ellipsis,
} from "lucide-react";
import type { NavigationItem } from "./types";

export const navigation: NavigationItem[] = [
  {
    label: "Hoy",
    href: "/",
    icon: House,
  },
  {
    label: "Diario",
    href: "/journal",
    icon: BookOpen,
  },
  {
    label: "Hábitos",
    href: "/habits",
    icon: Target,
  },
  {
    // "Progreso" was the last productivity word left in the product: it
    // names a rate toward a destination, which is exactly what this screen
    // refuses to measure. VOCABULARY.md had already chosen the right word
    // for this idea — "Streak → Camino" — and then never used it for the
    // screen the idea belongs to.
    label: "Camino",
    href: "/progress",
    icon: ChartColumn,
  },
  {
    label: "Más",
    href: "/more",
    icon: Ellipsis,
  },
];