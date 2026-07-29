"use client";

import { Body, Caption } from "@/components/ui/Typography";
import { useAtmosphere } from "@/components/atmosphere/AtmosphereContext";
import { ATMOSPHERES } from "@/lib/domain/atmosphere/atmosphere";

/**
 * Names and a sentence, never a grid of colour swatches.
 *
 * You choose a room by what it is for, not by its hex value — and a swatch
 * would frame this as a theme picker, which is the one thing an atmosphere
 * is not. The change itself is the demonstration: the light in the room
 * shifts under the chooser as you pick, over 600ms, and nothing moves.
 */
export default function AtmosphereChooser() {
  const { atmosphere, setAtmosphere } = useAtmosphere();

  return (
    <div
      className="space-y-2"
      role="radiogroup"
      aria-label="Atmósfera"
    >
      {ATMOSPHERES.map((option) => {
        const selected = option.id === atmosphere;

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setAtmosphere(option.id)}
            // The chooser has to obey the atmosphere it chooses. With a
            // hardcoded radius it was the one card in the product that never
            // changed shape — you picked Carbón and every card everywhere
            // went architectural except the one under your finger.
            className={`ser-card block w-full border p-5 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-faint sm:p-6 ${
              selected
                ? "border-ink-faint bg-surface-raised"
                : "border-line bg-surface hover:bg-surface-raised"
            }`}
          >
            <Body className="text-ink">{option.name}</Body>
            <Caption className="ser-voice mt-0.5">{option.description}</Caption>
          </button>
        );
      })}
    </div>
  );
}
