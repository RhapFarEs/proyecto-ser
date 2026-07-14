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
      className={`flex h-11 items-center justify-center rounded-full px-3 py-2 transition-all duration-200 ease-out ${
        active
          ? "min-w-[96px] bg-zinc-800/80 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "flex-1 text-zinc-500 hover:bg-zinc-900/70 hover:text-zinc-200"
      }`}
    >
      <div className={`flex items-center ${active ? "gap-2" : "gap-0"}`}>
        <Icon strokeWidth={1.75} size={20} />

        {active && (
          <span className="whitespace-nowrap text-sm font-medium">
            {item.label}
          </span>
        )}
      </div>
    </Link>
  );
}