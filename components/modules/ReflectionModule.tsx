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
          className="text-[1.75rem] font-light leading-[1.5] text-stone-100 sm:text-[2.05rem]"
        >
          {today.day.reflection}
        </Display>

        {/*
          This used to read "· PROYECTO SER ·" — the product signing its own
          wisdom, every morning, in the largest type on the screen. For an
          app whose principle is that the interface disappears behind the
          experience, a brand credit under each truth is the opposite of
          that. The line belongs to whoever is reading it.
        */}
        <Caption className="text-stone-600">Para hoy</Caption>
      </Card>
    </Section>
  );
}
