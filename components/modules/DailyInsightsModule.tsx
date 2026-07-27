import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { Body } from "@/components/ui/Typography";
import type { Insight } from "@/lib/domain/insights/insight";

type DailyInsightsModuleProps = {
  insight?: Insight | null;
};

export default function DailyInsightsModule({ insight }: DailyInsightsModuleProps) {
  if (!insight) {
    return null;
  }

  return (
    <Section>
      <Card className="border-0 bg-transparent p-0 shadow-none">
        <Body className="text-stone-400">{insight.message}</Body>
      </Card>
    </Section>
  );
}
