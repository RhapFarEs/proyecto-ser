"use client";

import { usePathname } from "next/navigation";

import { navigation } from "./navigation";
import NavigationItem from "./NavigationItem";

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-[380px] -translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface px-2 py-2 shadow-[0_18px_45px_rgba(0,0,0,0.12)] backdrop-blur-xl md:hidden">
      <div className="flex w-full items-center justify-between gap-1">
        {navigation.map((item) => (
          <NavigationItem
            key={item.href}
            item={item}
            active={pathname === item.href}
          />
        ))}
      </div>
    </nav>
  );
}