import Container from "@/components/ui/Container";
import { getToday } from "@/lib/today";
import GreetingSection from "@/components/dashboard/GreetingSection";
import ReflectionSection from "@/components/dashboard/ReflectionSection";
import RitualSection from "@/components/dashboard/RitualSection";
import IntentionSection from "@/components/dashboard/IntentionSection";
import FooterSection from "@/components/dashboard/FooterSection";

export default function Home() {
  const today = getToday();
  return (
    <main className="min-h-screen bg-black text-white">
      <Container>
        <GreetingSection today={today} />

        <ReflectionSection today={today} />

        <RitualSection today={today} />

        <IntentionSection today={today} />

        <FooterSection />

      </Container>
    </main>
  );
}