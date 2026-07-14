import type { ReactNode } from "react";
import { Body, Caption } from "./Typography";

type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-zinc-800/80 bg-zinc-950/50 px-6 py-10 text-center">
      <div className="max-w-sm space-y-3">
        <Body className="text-zinc-100">{title}</Body>
        {description ? <Caption>{description}</Caption> : null}
      </div>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
