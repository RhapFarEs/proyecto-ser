import MoodChip from "./MoodChip";

type MoodOption = {
  id: string;
  label: string;
};

type MoodSelectorProps = {
  moods: MoodOption[];
  selected?: string;
  onChange?: (value: string) => void;
};

export default function MoodSelector({
  moods,
  selected,
  onChange,
}: MoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((mood) => (
        <MoodChip
          key={mood.id}
          label={mood.label}
          selected={selected === mood.id}
          onClick={() => onChange?.(mood.id)}
        />
      ))}
    </div>
  );
}
