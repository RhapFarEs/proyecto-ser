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
      "border border-stone-700/80 bg-stone-800/90 text-white hover:bg-stone-700/90 disabled:border-stone-800 disabled:bg-stone-900/70 disabled:text-stone-600",
    secondary:
      "border border-stone-700/80 bg-transparent text-stone-200 hover:bg-stone-900/70 hover:text-white disabled:border-stone-800 disabled:text-stone-600",
    ghost:
      "bg-transparent text-stone-400 hover:bg-stone-900/70 hover:text-stone-100 disabled:text-stone-600",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      // `active:scale` gives a press something to answer with on touch,
      // where there is no hover state to confirm the tap landed.
      className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-out select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/40 active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100 ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
