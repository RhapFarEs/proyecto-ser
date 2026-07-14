import type { Today } from "@/lib/models/Today";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { Caption, Display } from "@/components/ui/Typography";

type ReflectionModuleProps = {
  today: Today;
};

export default function ReflectionModule({
  today,
}: ReflectionModuleProps) {
  return (
    <Section>
      <Card className="space-y-5 border-0 bg-transparent p-0 shadow-none sm:space-y-6">
        <Display className="text-[1.8rem] font-light leading-[1.45] text-zinc-100 sm:text-[2.15rem]">
          {today.day.reflection}
        </Display>

        <Caption className="uppercase tracking-[0.2em] text-zinc-500/90">
          · Proyecto SER ·
        </Caption>
      </Card>
    </Section>
  );
}
