import Link from "next/link";
import type { NavigationItem as NavigationItemType } from "./types";

type NavigationItemProps = {
  item: NavigationItemType;
  active?: boolean;
};

export default function NavigationItem({
  item,
  active = false,
}: NavigationItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      // An inactive item renders its icon only, so without an explicit name
      // a screen reader announces the app's primary navigation as five
      // unnamed links. `aria-current` is what tells assistive tech which
      // one is the current page — the visual pill can't convey that.
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={`flex h-11 items-center justify-center rounded-full px-3 py-2 transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-faint ${
        active
          ? "min-w-[96px] bg-surface-raised text-ink-strong"
          : "flex-1 text-ink-faint hover:bg-surface-raised hover:text-ink"
      }`}
    >
      <div className={`flex items-center ${active ? "gap-2" : "gap-0"}`}>
        <Icon strokeWidth={1.75} size={20} aria-hidden="true" />

        {active && (
          <span className="whitespace-nowrap text-sm font-medium">
            {item.label}
          </span>
        )}
      </div>
    </Link>
  );
}