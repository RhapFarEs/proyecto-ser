import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`rounded-[1.75rem] border border-line bg-surface p-5 backdrop-blur-sm sm:p-6 ${className}`.trim()}
    >
      {children}
    </div>
  );
}