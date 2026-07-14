import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import { Body } from "@/components/ui/Typography";

type TodayWeeklyFocusModuleProps = {
  weeklyFocusAreaTitle?: string | null;
};

/**
 * Read-only on purpose: the Life Area a week is focused on is chosen from
 * Weekly Review (`WeeklyFocusAreaModule`), which already owns that
 * interaction. Today only resolves and displays the same `Week` record's
 * `focusLifeAreaId` — no separate state, nothing editable here.
 */
export default function TodayWeeklyFocusModule({
  weeklyFocusAreaTitle,
}: TodayWeeklyFocusModuleProps) {
  if (!weeklyFocusAreaTitle) {
    return null;
  }

  return (
    <Section>
      <Card className="space-y-2">
        <SectionTitle>Área de enfoque esta semana</SectionTitle>
        <Body className="text-zinc-100">{weeklyFocusAreaTitle}</Body>
      </Card>
    </Section>
  );
}
