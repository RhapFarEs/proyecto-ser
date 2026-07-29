import { Body } from "@/components/ui/Typography";
import Divider from "@/components/ui/Divider";
import ModuleHeader from "@/components/ui/ModuleHeader";

export default function JournalPromptModule() {
  return (
    <section className="space-y-2">
      <ModuleHeader
        title="Una pregunta para ti"
        subtitle="No busques la respuesta perfecta. Solo responde con honestidad."
      />

      <div className="ser-field border border-line bg-surface px-4 py-3">
        <Body className="text-ink">
          ¿Qué ocupa más espacio en tu mente hoy?
        </Body>
      </div>

      <Divider />
    </section>
  );
}
