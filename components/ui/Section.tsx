import { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export default function Section({ children, className = "" }: SectionProps) {
  return <section className={`mt-8 sm:mt-10 ${className}`.trim()}>{children}</section>;
}