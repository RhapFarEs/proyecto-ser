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
    // Serif, and this is the product's visual signature. Display carries the
    // largest text on every screen — the greeting that says your name, the
    // sentence offered for today, each page's title — and all of it is
    // addressed to a person rather than reporting on a system. Tracking goes
    // back to normal: the negative letter-spacing was compensating for a
    // grotesque sans, and a serif at this size needs its own rhythm left
    // alone.
    // Weight comes from the atmosphere, not from here. Light text on a dark
    // ground reads optically heavier than it is, so the 300 that is elegant
    // in Tinta looks anaemic as dark-on-light and Papel carries 400 to
    // *appear* the same. A theme would swap the colour and leave this broken.
    <Element
      className={`ser-voice ser-display-weight text-4xl leading-[1.1] text-ink-strong sm:text-5xl ${className}`}
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
      // `ser-reading` — the air between lines is the atmosphere's, since a
      // gallery gives text more room than a lamplit desk does.
      className={`ser-reading block text-[1.0625rem] text-ink-soft ${className}`}
      {...props}
    >
      {children}
    </Element>
  );
}

export function Caption({ children, className = "", ...props }: ParagraphProps) {
  return (
    <p className={`text-sm leading-6 text-ink-faint ${className}`} {...props}>
      {children}
    </p>
  );
}
