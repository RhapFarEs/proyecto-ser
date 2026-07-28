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
      // contact form. Book scale, open leading, and the serif reserved for a
      // person's own voice: writing into it slows the hand a little, and what
      // comes back out reads like a notebook rather than a field. The
      // placeholder stays sans, because that line is the app talking.
      className={`min-h-[180px] w-full resize-none rounded-[1.35rem] border border-line bg-surface px-4 py-3.5 ser-voice text-[1.0625rem] leading-[1.85] text-ink outline-none transition-all duration-200 placeholder:font-sans placeholder:text-ink-faint focus:border-ink-faint focus:bg-surface-raised focus-visible:ring-2 focus-visible:ring-ink-faint ${className}`.trim()}
      {...props}
    />
  );
}
