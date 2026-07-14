import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { Caption } from "@/components/ui/Typography";

export default function FooterModule() {
  return (
    <Section>
      <Card className="space-y-3 border-0 bg-transparent p-0 shadow-none">
        <Caption className="text-center uppercase tracking-[0.25em] text-zinc-600">
          Ser antes que hacer.
        </Caption>

        <Caption className="text-center text-xs text-zinc-700">
          Proyecto SER
        </Caption>
      </Card>
    </Section>
  );
}
