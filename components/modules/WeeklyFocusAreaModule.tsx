import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import MoodSelector from "@/components/ui/MoodSelector";
import type { LifeArea } from "@/lib/domain/life-area/life-area";

const NO_AREA_OPTION_ID = "none";

type WeeklyFocusAreaModuleProps = {
  areas?: LifeArea[];
  focusLifeAreaId?: string;
  onSelect?: (lifeAreaId: string | undefined) => void;
};

export default function WeeklyFocusAreaModule({
  areas = [],
  focusLifeAreaId,
  onSelect,
}: WeeklyFocusAreaModuleProps) {
  const activeAreas = areas.filter((area) => area.active);
  const selectedArea = focusLifeAreaId
    ? areas.find((area) => area.id === focusLifeAreaId)
    : undefined;
  const selectedIsArchived = Boolean(selectedArea && !selectedArea.active);

  if (activeAreas.length === 0 && !selectedIsArchived) {
    return null;
  }

  const options = [
    { id: NO_AREA_OPTION_ID, label: "Sin área específica" },
    ...activeAreas.map((area) => ({ id: area.id, label: area.title })),
    ...(selectedIsArchived && selectedArea
      ? [{ id: selectedArea.id, label: `${selectedArea.title} (archivada)` }]
      : []),
  ];

  const selected = focusLifeAreaId ?? NO_AREA_OPTION_ID;

  return (
    <Section>
      <Card className="space-y-4">
        <SectionTitle>Área que quieres cuidar esta semana</SectionTitle>

        <MoodSelector
          moods={options}
          selected={selected}
          onChange={(value) => onSelect?.(value === NO_AREA_OPTION_ID ? undefined : value)}
        />
      </Card>
    </Section>
  );
}
