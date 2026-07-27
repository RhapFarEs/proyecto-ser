import Section from "@/components/ui/Section";
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
      {/*
        No card, no border, no surface. This was framed in a bordered panel
        when it was first built, which was a mistake: a memory presented in a
        container reads as a widget the product is showing you, and the whole
        effect depends on it reading as something found. Text on the page,
        held only by the space around it. Extra room above and below so it
        sits apart from the day's business without being announced.
      */}
      <div className="space-y-3 py-4 sm:py-6">
        <Caption className="text-stone-600">{getLabel(echo)}</Caption>

        {/*
          Their words, verbatim and unabridged — never trimmed to a preview.
          A memory shown in fragments is a citation; this has to be the thing
          itself. Light weight and open leading so it reads as a voice rather
          than as interface copy.
        */}
        <Body className="text-xl font-light leading-[1.6] text-stone-200 sm:text-2xl">
          {echo.text}
        </Body>
      </div>
    </Section>
  );
}
