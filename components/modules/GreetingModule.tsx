import type { Today } from "@/lib/models/Today";
import { formatGreeting } from "@/lib/greeting";
import { Display, Caption } from "@/components/ui/Typography";

type GreetingModuleProps = {
  today: Today;
  displayName?: string | null;
};

export default function GreetingModule({
  today,
  displayName,
}: GreetingModuleProps) {
  return (
    <header className="pb-2 sm:pb-3">
      <Display>{formatGreeting(today.greeting, displayName)}</Display>

      <Caption className="mt-3 first-letter:uppercase">
        {today.date}
      </Caption>
    </header>
  );
}
