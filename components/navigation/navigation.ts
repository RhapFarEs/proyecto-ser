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
    label: "Progreso",
    href: "/progress",
    icon: ChartColumn,
  },
  {
    label: "Más",
    href: "/more",
    icon: Ellipsis,
  },
];