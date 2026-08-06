type MoodChipProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export default function MoodChip({
  label,
  selected = false,
  onClick,
}: MoodChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      // Selection is conveyed only by border/background, which assistive
      // tech can't read — `aria-pressed` makes the state announced.
      aria-pressed={selected}
      className={`rounded-full border px-3 py-3 text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-faint active:scale-[0.97] ${
        selected
          ? "border-ink-faint bg-surface-raised text-ink-strong"
          : "border-line bg-transparent text-ink-soft hover:border-line hover:bg-surface-raised hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
