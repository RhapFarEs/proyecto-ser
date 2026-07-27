import type { HTMLAttributes, ReactNode } from "react";

/**
 * Text primitives accept the standard HTML attributes of the element they
 * render, so callers can attach `role`, `aria-*`, or `id` where an
 * accessible name or a live region is needed. Without this they silently
 * rejected every accessibility attribute.
 */
type TypographyProps = {
  children: ReactNode;
  className?: string;
};

type ParagraphProps = TypographyProps & Omit<HTMLAttributes<HTMLParagraphElement>, "className">;

/** Element-agnostic, since Display can render as a heading, p, or blockquote. */
type DisplayProps = TypographyProps &
  Omit<HTMLAttributes<HTMLElement>, "className"> & {
    as?: "h1" | "h2" | "p" | "blockquote";
  };

/**
 * Display is a visual treatment, not always a page title. `as` exists
 * because the daily reflection uses this size but is a quotation, not the
 * page's heading — rendering it as a second <h1> put two top-level
 * headings on Today and broke heading navigation for screen readers.
 */
export function Display({
  children,
  className = "",
  as: Element = "h1",
  ...props
}: DisplayProps) {
  return (
    <Element
      className={`text-4xl font-light leading-[0.95] tracking-[-0.02em] text-stone-50 sm:text-5xl ${className}`}
      {...props}
    >
      {children}
    </Element>
  );
}

/** `as="span"` for the cases where this text sits inside another element that may not contain a <p>. */
/**
 * Body and Caption used to be 16.3px and 15.2px. A one-pixel difference is
 * not a hierarchy, it is an unmade decision — and it left every screen
 * looking evenly weighted, with nothing to read first. Body is now clearly
 * prose (17px, generous leading, meant to be read) and Caption is clearly
 * metadata (14px). The gap does the work that a bold weight would otherwise
 * have to shout for.
 */
export function Body({
  children,
  className = "",
  as: Element = "p",
  ...props
}: ParagraphProps & { as?: "p" | "span" }) {
  return (
    <Element
      className={`block text-[1.0625rem] leading-[1.75] text-stone-300 ${className}`}
      {...props}
    >
      {children}
    </Element>
  );
}

export function Caption({ children, className = "", ...props }: ParagraphProps) {
  return (
    <p className={`text-sm leading-6 text-stone-500 ${className}`} {...props}>
      {children}
    </p>
  );
}
