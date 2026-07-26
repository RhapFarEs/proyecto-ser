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
      className={`rounded-full border px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40 ${
        selected
          ? "border-zinc-600 bg-zinc-800/90 text-zinc-50"
          : "border-zinc-800/80 bg-transparent text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/70 hover:text-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}
