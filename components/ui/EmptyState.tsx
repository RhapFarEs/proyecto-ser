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
    <div className="ser-card flex flex-col items-center justify-center border border-line bg-surface px-6 py-10 text-center">
      <div className="max-w-sm space-y-3">
        <Body className="text-ink">{title}</Body>
        {description ? <Caption>{description}</Caption> : null}
      </div>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
