import type { InputHTMLAttributes } from "react";

type InputProps = {
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      // A border shifting from stone-800 to stone-600 is nearly invisible as a
      // focus indicator; the ring matches Button's so keyboard focus is
      // equally legible on every control.
      className={`w-full rounded-[1.35rem] border border-stone-800/80 bg-stone-950/70 px-4 py-3 text-base leading-7 text-stone-100 outline-none transition-all duration-200 placeholder:text-stone-500 focus:border-stone-600 focus:bg-stone-900/70 focus-visible:ring-2 focus-visible:ring-stone-400/40 ${className}`.trim()}
      {...props}
    />
  );
}
