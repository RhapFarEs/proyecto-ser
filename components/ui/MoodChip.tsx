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
      className={`rounded-full border px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/40 active:scale-[0.97] ${
        selected
          ? "border-stone-600 bg-stone-800/90 text-stone-50"
          : "border-stone-800/80 bg-transparent text-stone-400 hover:border-stone-700 hover:bg-stone-900/70 hover:text-stone-200"
      }`}
    >
      {label}
    </button>
  );
}
