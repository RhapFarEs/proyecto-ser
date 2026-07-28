import { ReactNode } from "react";

type SectionTitleProps = {
  children: ReactNode;
  className?: string;
};

/**
 * A quiet label, not an announcement.
 *
 * This used to be 0.7rem, uppercase, semibold, `tracking-[0.3em]` — the
 * single most borrowed element in the interface. Spaced-out capitals are the
 * house style of every dark SaaS dashboard, and they were fighting the
 * product's own voice: SER is meant to sound like a calm friend talking
 * about your day, and a friend does not announce sections in small caps.
 *
 * Sentence case, normal weight, no tracking, dim. It names the thing and
 * gets out of the way, which is all a label owes anyone.
 */
export default function SectionTitle({
  children,
  className = "",
}: SectionTitleProps) {
  return (
    <h2
      className={`mb-3 text-sm font-normal text-ink-faint sm:mb-4 ${className}`.trim()}
    >
      {children}
    </h2>
  );
}
