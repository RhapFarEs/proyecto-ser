import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    // Corner, edge and shadow come from the atmosphere (`ser-card`): paper
    // curls, stone is cut. Padding does not — the grid is identity, and an
    // atmosphere that moved it would be a different product rather than the
    // same product in a different light.
    <div
      className={`ser-card border-line bg-surface p-5 backdrop-blur-sm sm:p-6 ${className}`.trim()}
    >
      {children}
    </div>
  );
}