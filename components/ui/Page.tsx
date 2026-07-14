import type { ReactNode } from "react";

import Container from "@/components/ui/Container";
import { Caption, Display } from "@/components/ui/Typography";

type PageProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function Page({ title, subtitle, children }: PageProps) {
  const hasHeader = Boolean(title || subtitle);

  return (
    <Container>
      <div className="space-y-6 sm:space-y-8">
        {hasHeader ? (
          <header className="pb-2 sm:pb-3">
            <Display>{title}</Display>

            {subtitle ? (
              <Caption className="mt-3 first-letter:uppercase">{subtitle}</Caption>
            ) : null}
          </header>
        ) : null}

        {children}
      </div>
    </Container>
  );
}
