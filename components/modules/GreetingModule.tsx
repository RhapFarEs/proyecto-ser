import type { Today } from "@/lib/models/Today";
import { Display, Caption } from "@/components/ui/Typography";

type GreetingModuleProps = {
  today: Today;
};

export default function GreetingModule({
  today,
}: GreetingModuleProps) {
  return (
    <header className="pb-2 sm:pb-3">
      <Display>{today.greeting}, Jacobo</Display>

      <Caption className="mt-3 first-letter:uppercase">
        {today.date}
      </Caption>
    </header>
  );
}
