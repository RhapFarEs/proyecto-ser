"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigation } from "@/components/navigation/navigation";
import { Caption } from "@/components/ui/Typography";

/**
 * Desktop navigation. This was an empty bordered column containing only a
 * comment, and `BottomNavigation` is `md:hidden` — so on any screen wider
 * than the mobile breakpoint the app had no navigation at all and every
 * screen but Today was unreachable.
 *
 * Same `navigation` list the bottom bar uses, so the two can never drift.
 */
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-800/80 md:block">
      <div className="sticky top-0 flex h-screen flex-col gap-8 px-6 py-10">
        <Link
          href="/"
          className="rounded-2xl px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40"
        >
          <Caption className="uppercase tracking-[0.25em] text-zinc-500">
            Proyecto SER
          </Caption>
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40 ${
                      active
                        ? "bg-zinc-800/80 text-white"
                        : "text-zinc-500 hover:bg-zinc-900/70 hover:text-zinc-200"
                    }`}
                  >
                    <Icon strokeWidth={1.75} size={18} aria-hidden="true" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Caption className="mt-auto text-xs text-zinc-700">
          Ser antes que hacer.
        </Caption>
      </div>
    </aside>
  );
}
