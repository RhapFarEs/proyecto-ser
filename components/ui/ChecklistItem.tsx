import { ReactNode } from "react";

type ChecklistItemProps = {
  children: ReactNode;
};

export default function ChecklistItem({
  children,
}: ChecklistItemProps) {
  return (
    <div className="group flex items-center gap-4 transition-colors duration-200">
      <div className="h-4 w-4 rounded border border-zinc-600 transition-colors group-hover:border-zinc-300" />

      <span className="text-lg text-zinc-100 transition-colors group-hover:text-white">
        {children}
      </span>
    </div>
  );
}