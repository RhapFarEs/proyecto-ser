import type { Today } from "@/lib/models/Today";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { Caption, Display } from "@/components/ui/Typography";

type ReflectionModuleProps = {
  today: Today;
};

export default function ReflectionModule({
  today,
}: ReflectionModuleProps) {
  return (
    <Section>
      {/* `ser-breathe-in`: this arrives a beat after the rest of the page. */}
      <Card className="ser-breathe-in space-y-5 border-0 bg-transparent p-0 shadow-none sm:space-y-6">
        {/* A quotation, not the page's heading — see Display's `as`. */}
        <Display
          as="blockquote"
          className="text-[1.75rem] leading-[1.5] text-ink sm:text-[2.05rem]"
        >
          {today.day.reflection}
        </Display>

        {/*
          This used to read "· PROYECTO SER ·" — the product signing its own
          wisdom, every morning, in the largest type on the screen. For an
          app whose principle is that the interface disappears behind the
          experience, a brand credit under each truth is the opposite of that.

          When the line is the person's own, the label says so and stops
          there. No date, no "hace un año", no observation about how they've
          changed — that is the echo's job, and it earns the explanation by
          being rare. Here the sentence simply belongs to them, the way a
          note in a margin belongs to whoever wrote it.
        */}
        <Caption className="text-ink-faint">
          {today.day.reflectionIsOwn ? "Tus palabras" : "Para hoy"}
        </Caption>
      </Card>
    </Section>
  );
}
