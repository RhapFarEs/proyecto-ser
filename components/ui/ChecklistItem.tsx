import { ReactNode } from "react";
import { Body, Caption } from "@/components/ui/Typography";

type ChecklistItemProps = {
  children: ReactNode;
  checked?: boolean;
  onClick?: () => void;
  /** The person's own reason for this practice, shown only while it is still ahead of them. */
  note?: string;
};

export default function ChecklistItem({
  children,
  checked = false,
  onClick,
  note,
}: ChecklistItemProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        // The checked state is purely visual (a filled square), so without
        // `aria-checked` a screen reader can't tell a sustained practice
        // from one not yet done today. `role="checkbox"` is what makes that
        // attribute meaningful on a <button>.
        role="checkbox"
        aria-checked={checked}
        className="group flex w-full items-center gap-3 rounded-2xl py-2 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40 active:scale-[0.99] sm:gap-4"
      >
        {/*
          Marking a practice is the gesture this app asks for most often, so
          it is the one that most deserves to feel like something. The box
          eases into its filled state and swells very slightly on press —
          the confirmation is physical, not a message.
        */}
        <div
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 rounded border transition-all duration-300 ease-out group-active:scale-110 ${
            checked
              ? "border-zinc-200 bg-zinc-200"
              : "border-zinc-600 group-hover:border-zinc-400"
          }`}
        />

        <span className="min-w-0">
          <Body
            className={`text-base leading-6 transition-colors sm:text-lg sm:leading-7 ${
              checked ? "text-zinc-400" : "text-zinc-100"
            }`}
            // A <p> can't live inside the <button>'s accessible label
            // without adding noise; the reason is decoration for the eye.
            as="span"
          >
            {children}
          </Body>

          {/*
            The one thing separating a ritual from a checklist is the
            reason the person attached to it — which the app asks for at
            creation and then never showed again. It appears while the
            practice is still ahead of them, and steps out of the way once
            it's sustained: the "why" is for the moment of choosing.
          */}
          {note && !checked ? (
            <Caption className="mt-0.5 block text-zinc-600">{note}</Caption>
          ) : null}
        </span>
      </button>
    );
  }

  return (
    <div className="group flex items-center gap-3 py-2 transition-colors duration-200 sm:gap-4">
      <div className="h-4 w-4 shrink-0 rounded border border-zinc-600 transition-colors group-hover:border-zinc-300" />

      <Body className="text-base leading-6 text-zinc-100 transition-colors group-hover:text-white sm:text-lg sm:leading-7">
        {children}
      </Body>
    </div>
  );
}