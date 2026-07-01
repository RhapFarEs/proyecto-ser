import type { Today } from "@/lib/models/Today";
import Section from "@/components/ui/Section";

type ReflectionSectionProps = {
  today: Today;
};

export default function ReflectionSection({
  today,
}: ReflectionSectionProps) {
  return (
    <Section>
      <p className="text-4xl font-light leading-relaxed text-zinc-100">
        {today.day.reflection}
      </p>

      <p className="mt-6 text-sm uppercase tracking-[0.2em] text-zinc-500">
        · Proyecto SER ·
      </p>
    </Section>
  );
}