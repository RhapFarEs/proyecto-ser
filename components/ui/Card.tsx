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
    <div
      className={`rounded-[1.75rem] border border-zinc-800/80 bg-zinc-950/60 p-5 backdrop-blur-sm sm:p-6 ${className}`.trim()}
    >
      {children}
    </div>
  );
}