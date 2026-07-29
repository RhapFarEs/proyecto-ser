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
      className={`ser-field w-full border border-line bg-surface px-4 py-3 text-base leading-7 text-ink outline-none transition-all duration-200 placeholder:text-ink-faint focus:border-ink-faint focus:bg-surface-raised focus-visible:ring-2 focus-visible:ring-ink-faint ${className}`.trim()}
      {...props}
    />
  );
}
