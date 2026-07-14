import type { TextareaHTMLAttributes } from "react";

type TextAreaProps = {
  className?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function TextArea({ className = "", ...props }: TextAreaProps) {
  return (
    <textarea
      className={`min-h-[180px] w-full resize-none rounded-[1.35rem] border border-zinc-800/80 bg-zinc-950/70 px-4 py-3 text-base leading-7 text-zinc-100 outline-none transition-all duration-200 placeholder:text-zinc-500 focus:border-zinc-600 focus:bg-zinc-900/70 ${className}`.trim()}
      {...props}
    />
  );
}
