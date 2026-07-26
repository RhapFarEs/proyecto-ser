import type { InputHTMLAttributes } from "react";

type InputProps = {
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      // A border shifting from zinc-800 to zinc-600 is nearly invisible as a
      // focus indicator; the ring matches Button's so keyboard focus is
      // equally legible on every control.
      className={`w-full rounded-[1.35rem] border border-zinc-800/80 bg-zinc-950/70 px-4 py-3 text-base leading-7 text-zinc-100 outline-none transition-all duration-200 placeholder:text-zinc-500 focus:border-zinc-600 focus:bg-zinc-900/70 focus-visible:ring-2 focus-visible:ring-zinc-400/40 ${className}`.trim()}
      {...props}
    />
  );
}
