import { ReactNode } from "react";

type TypographyProps = {
  children: ReactNode;
  className?: string;
};

export function Display({
  children,
  className = "",
}: TypographyProps) {
  return (
    <h1
      className={`text-4xl font-light leading-[0.95] tracking-[-0.02em] text-zinc-50 sm:text-5xl ${className}`}
    >
      {children}
    </h1>
  );
}

export function Body({
  children,
  className = "",
}: TypographyProps) {
  return (
    <p className={`text-base leading-7 text-zinc-300 sm:text-[1.02rem] ${className}`}>
      {children}
    </p>
  );
}

export function Caption({
  children,
  className = "",
}: TypographyProps) {
  return (
    <p className={`text-sm leading-6 text-zinc-500 sm:text-[0.95rem] ${className}`}>
      {children}
    </p>
  );
}