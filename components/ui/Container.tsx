import { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
};

export default function Container({ children }: ContainerProps) {
  return (
    // `ser-settle-in` is the app's one page-level motion: arriving on a
    // screen fades and lifts slightly instead of snapping. Disabled
    // wholesale under prefers-reduced-motion (see globals.css).
    <div className="ser-settle-in mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-16">
      {children}
    </div>
  );
}