import type { ReactNode } from "react";

import Page from "@/components/ui/Page";
import { Caption } from "@/components/ui/Typography";

type LegalPageProps = {
  title: string;
  subtitle: string;
  updatedAt: string;
  children: ReactNode;
};

/**
 * The two documents a person may need to read before they have an account,
 * and after they no longer have one.
 *
 * Same shell as every other screen so they do not read as something bolted
 * on, and `ser-reading` prose so a long page is as legible as the rest of
 * the product.
 */
export default function LegalPage({ title, subtitle, updatedAt, children }: LegalPageProps) {
  return (
    <Page title={title} subtitle={subtitle}>
      <div className="ser-reading space-y-6 text-[1.0625rem] text-ink-soft [&_h2]:pt-2 [&_h2]:text-lg [&_h2]:text-ink-strong [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
        {children}
      </div>

      <Caption>Última actualización: {updatedAt}.</Caption>
    </Page>
  );
}
