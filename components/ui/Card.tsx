import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
};

export default function Card({ children }: CardProps) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-sm">
      {children}
    </div>
  );
}