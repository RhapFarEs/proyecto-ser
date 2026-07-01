import { ReactNode } from "react";

type SectionTitleProps = {
  children: ReactNode;
};

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
      {children}
    </h2>
  );
}