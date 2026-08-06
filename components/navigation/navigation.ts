import {
  House,
  BookOpen,
  Target,
  Footprints,
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
    label: "Prácticas",
    href: "/habits",
    icon: Target,
  },
  {
    // "Progreso" was the last productivity word left in the product: it
    // names a rate toward a destination, which is exactly what this screen
    // refuses to measure. VOCABULARY.md had already chosen the right word
    // for this idea — "Streak → Camino" — and then never used it for the
    // screen the idea belongs to.
    // The label was corrected before the icon was, so a bar chart sat next
    // to the word "Camino" and went on promising the measurement the screen
    // exists to refuse — an icon is read before a label, so it was the part
    // still making the claim. Footprints are what a path is made of: traces
    // left by walking, with nothing to compare them against.
    label: "Camino",
    href: "/progress",
    icon: Footprints,
  },
  {
    label: "Más",
    href: "/more",
    icon: Ellipsis,
  },
];