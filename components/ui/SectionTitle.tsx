import { ReactNode } from "react";

type SectionTitleProps = {
  children: ReactNode;
  className?: string;
};

export default function SectionTitle({
  children,
  className = "",
}: SectionTitleProps) {
  return (
    <h2
      className={`mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-zinc-500 sm:mb-5 sm:text-xs ${className}`.trim()}
    >
      {children}
    </h2>
  );
}