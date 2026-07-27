import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { Caption } from "@/components/ui/Typography";

export default function FooterModule() {
  return (
    <Section>
      {/*
        The brand name used to sit under the tagline here. You already know
        which app you're in — repeating the name at the bottom of the home
        screen every morning is the product talking about itself. The line
        that means something stays; the signature goes.
      */}
      <Card className="border-0 bg-transparent p-0 shadow-none">
        <Caption className="text-center uppercase tracking-[0.25em] text-zinc-600">
          Ser antes que hacer.
        </Caption>
      </Card>
    </Section>
  );
}
