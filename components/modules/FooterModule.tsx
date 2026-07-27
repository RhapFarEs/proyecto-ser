import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { Caption } from "@/components/ui/Typography";

/** Kept only until the person has written a direction of their own. */
const PRODUCT_MOTTO = "Ser antes que hacer.";

type FooterModuleProps = {
  /** The person's own personal direction, if they have written one. */
  personalMotto?: string | null;
};

export default function FooterModule({ personalMotto }: FooterModuleProps) {
  const motto = personalMotto?.trim();

  return (
    <Section>
      {/*
        The brand name used to sit under the tagline here. You already know
        which app you're in — repeating the name at the bottom of the home
        screen every morning is the product talking about itself.

        And once someone has written where they are walking, the product's
        motto has no business being the last thing they read each morning.
        Theirs replaces it. It is the same slot, the same weight, the same
        quiet — the only difference is whose sentence it is, which is the
        entire difference between a product someone uses and a place that
        belongs to them. Nobody configures this; it appears because they
        wrote something down once, months ago, in another screen.

        Said in lowercase rather than spaced capitals: uppercase made a motto
        read as a slogan on a wall, and this should read as a thought.
      */}
      <Card className="border-0 bg-transparent p-0 shadow-none">
        <Caption className={`text-center text-stone-600 ${motto ? "ser-voice" : ""}`.trim()}>
          {motto || PRODUCT_MOTTO}
        </Caption>
      </Card>
    </Section>
  );
}
