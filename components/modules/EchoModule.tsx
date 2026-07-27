import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { Body, Caption } from "@/components/ui/Typography";
import type { Echo } from "@/lib/domain/memory/echo";
import { formatDateKeyLongLabel } from "@/lib/date";

/**
 * Hands back something the person wrote long ago, and then says nothing.
 *
 * The silence underneath is the design. Every instinct pulls toward adding
 * a line here — "mira cuánto has cambiado", "¿sigue siendo verdad?", a link
 * to read more — and every one of those turns a memory into a prompt. The
 * person is the only one entitled to decide what their own words mean now.
 * The app's whole contribution is having chosen this moment to be quiet in.
 */
function getLabel(echo: Echo): string {
  if (echo.kind === "anniversary") {
    return echo.yearsAgo === 1
      ? "Hace un año, un día como hoy, escribiste esto."
      : `Hace ${echo.yearsAgo} años, un día como hoy, escribiste esto.`;
  }

  return `Escribiste esto el ${formatDateKeyLongLabel(echo.dateKey)}.`;
}

type EchoModuleProps = {
  echo?: Echo | null;
};

export default function EchoModule({ echo }: EchoModuleProps) {
  if (!echo) {
    return null;
  }

  return (
    <Section>
      <Card className="space-y-3 border-zinc-800/60 bg-zinc-950/40">
        <Caption className="text-zinc-600">{getLabel(echo)}</Caption>

        {/*
          Their words, verbatim and unabridged — never trimmed to a preview.
          A memory shown in fragments is a citation; this has to be the
          thing itself. Set slightly larger and lighter than body text so it
          reads as a voice rather than as interface copy.
        */}
        <Body className="text-lg font-light leading-8 text-zinc-200 sm:text-xl sm:leading-9">
          {echo.text}
        </Body>
      </Card>
    </Section>
  );
}
