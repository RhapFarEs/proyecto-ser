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
    // Inverted rather than raised. A raised surface reads as "primary" only
    // on a dark ground; on paper it is indistinguishable from the secondary
    // hover state. Inverting ink and ground is the one emphasis that means
    // the same thing in both polarities — and it matches the segmented
    // control in the journal, which already worked this way.
    primary:
      "border border-transparent bg-ink-strong text-ground hover:opacity-90 disabled:border-line disabled:bg-transparent disabled:text-ink-faint",
    secondary:
      "border border-line bg-transparent text-ink hover:bg-surface-raised hover:text-ink-strong disabled:border-line disabled:text-ink-faint",
    ghost:
      "bg-transparent text-ink-soft hover:bg-surface-raised hover:text-ink disabled:text-ink-faint",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      /*
        `py-3` rather than `py-2.5`: with a 20px line box that is a 44px
        target, which is the documented minimum on both mobile platforms.
        At 2.5 every button in the product was 40px, on a product whose
        primary surface is a phone.

        `active:scale` gives a press something to answer with on touch,
        where there is no hover state to confirm the tap landed.
      */
      className={`inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 ease-out select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-faint active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100 ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
