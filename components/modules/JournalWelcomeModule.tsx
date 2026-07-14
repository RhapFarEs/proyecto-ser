import Divider from "@/components/ui/Divider";
import ModuleHeader from "@/components/ui/ModuleHeader";

export default function JournalWelcomeModule() {
  return (
    <section className="space-y-3">
      <ModuleHeader
        title="Antes de escribir"
        subtitle="No necesitas encontrar las palabras perfectas. Solo empieza por las verdaderas."
      />
      <Divider />
    </section>
  );
}
