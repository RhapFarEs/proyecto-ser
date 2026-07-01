import type { Today } from "@/lib/models/Today";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import Card from "@/components/ui/Card";

type IntentionSectionProps = {
  today: Today;
};

export default function IntentionSection({
  today,
}: IntentionSectionProps) {
  return (
    <Section>
      <Card>
        <SectionTitle>Intención del día</SectionTitle>

        <p className="text-2xl font-light text-zinc-100">
          {today.day.intention}
        </p>
      </Card>
    </Section>
  );
}