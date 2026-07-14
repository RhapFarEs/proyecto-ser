import { Body } from "@/components/ui/Typography";
import Divider from "@/components/ui/Divider";
import ModuleHeader from "@/components/ui/ModuleHeader";

export default function JournalPromptModule() {
  return (
    <section className="space-y-3">
      <ModuleHeader
        title="Una pregunta para ti"
        subtitle="No busques la respuesta perfecta. Solo responde con honestidad."
      />

      <div className="rounded-[1.35rem] border border-zinc-800/80 bg-zinc-950/50 px-4 py-4">
        <Body className="text-zinc-100">
          ¿Qué ocupa más espacio en tu mente hoy?
        </Body>
      </div>

      <Divider />
    </section>
  );
}
