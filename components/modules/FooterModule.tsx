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
        {/*
          Said quietly rather than set in spaced capitals. Uppercase made the
          product's own motto read as a slogan on a wall; lowercase makes it
          read as a thought — which is what it is, and the last thing on the
          screen every morning.
        */}
        <Caption className="text-center text-stone-600">Ser antes que hacer.</Caption>
      </Card>
    </Section>
  );
}
