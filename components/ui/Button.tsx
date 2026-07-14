import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

export default function Button({
  children,
  className = "",
  variant = "primary",
  disabled = false,
  type = "button",
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary:
      "border border-zinc-700/80 bg-zinc-800/90 text-white hover:bg-zinc-700/90 disabled:border-zinc-800 disabled:bg-zinc-900/70 disabled:text-zinc-600",
    secondary:
      "border border-zinc-700/80 bg-transparent text-zinc-200 hover:bg-zinc-900/70 hover:text-white disabled:border-zinc-800 disabled:text-zinc-600",
    ghost:
      "bg-transparent text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-100 disabled:text-zinc-600",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-out select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
