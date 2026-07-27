import type { TextareaHTMLAttributes } from "react";

type TextAreaProps = {
  className?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function TextArea({ className = "", ...props }: TextAreaProps) {
  return (
    <textarea
      // Every textarea in this product is a place where someone tells
      // themselves the truth: the journal, the day's intention, the personal
      // direction, the weekly reflection. It was set at UI scale — 16px with
      // form leading — which asks for a confession in the typography of a
      // contact form. Book scale and open leading make writing feel slower
      // and reading feel like re-reading a notebook rather than a field.
      className={`min-h-[180px] w-full resize-none rounded-[1.35rem] border border-stone-800/80 bg-stone-950/70 px-4 py-3.5 text-[1.0625rem] leading-[1.85] text-stone-100 outline-none transition-all duration-200 placeholder:text-stone-600 focus:border-stone-600 focus:bg-stone-900/60 focus-visible:ring-2 focus-visible:ring-stone-400/40 ${className}`.trim()}
      {...props}
    />
  );
}
