import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}