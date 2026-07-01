import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import type { Today } from "@/lib/models/Today";
import ChecklistItem from "@/components/ui/ChecklistItem";
import Card from "@/components/ui/Card";
type RitualSectionProps = {
  today: Today;
};

export default function RitualSection({
  today,
}: RitualSectionProps) {
  return (
    <Section>
      <Card>
      <SectionTitle>{today.day.ritual.name}</SectionTitle>

      <div className="space-y-4">
      {today.day.ritual.activities.map((activity) => (
  <ChecklistItem key={activity}>
    {activity}
  </ChecklistItem>
))}
      </div>
      </Card>
    </Section>
  );
}