import { ReactNode } from "react";
import { Body } from "@/components/ui/Typography";

type ChecklistItemProps = {
  children: ReactNode;
  checked?: boolean;
  onClick?: () => void;
};

export default function ChecklistItem({
  children,
  checked = false,
  onClick,
}: ChecklistItemProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        // The checked state is purely visual (a filled square), so without
        // `aria-checked` a screen reader can't tell a sustained practice
        // from one not yet done today. `role="checkbox"` is what makes that
        // attribute meaningful on a <button>.
        role="checkbox"
        aria-checked={checked}
        className="flex w-full items-center gap-3 rounded-2xl py-2 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40 sm:gap-4"
      >
        <div
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 rounded border transition-colors ${
            checked ? "border-zinc-200 bg-zinc-200" : "border-zinc-600"
          }`}
        />

        <Body
          className={`text-base leading-6 transition-colors sm:text-lg sm:leading-7 ${
            checked ? "text-zinc-400" : "text-zinc-100"
          }`}
        >
          {children}
        </Body>
      </button>
    );
  }

  return (
    <div className="group flex items-center gap-3 py-2 transition-colors duration-200 sm:gap-4">
      <div className="h-4 w-4 shrink-0 rounded border border-zinc-600 transition-colors group-hover:border-zinc-300" />

      <Body className="text-base leading-6 text-zinc-100 transition-colors group-hover:text-white sm:text-lg sm:leading-7">
        {children}
      </Body>
    </div>
  );
}