import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ConfirmButton from "@/components/ui/ConfirmButton";
import EmptyState from "@/components/ui/EmptyState";
import SectionTitle from "@/components/ui/SectionTitle";
import { Body, Caption } from "@/components/ui/Typography";
import type { LifeArea } from "@/lib/domain/life-area/life-area";

type LifeAreaListModuleProps = {
  areas: LifeArea[];
  onCreateNew: () => void;
  onEdit: (area: LifeArea) => void;
  onToggleActive: (id: string) => void;
  onToggleFocus: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function LifeAreaListModule({
  areas,
  onCreateNew,
  onEdit,
  onToggleActive,
  onToggleFocus,
  onDelete,
}: LifeAreaListModuleProps) {
  const activeAreas = areas.filter((area) => area.active);
  const archivedAreas = areas.filter((area) => !area.active);

  return (
    <div className="space-y-5">
      <Button type="button" variant="primary" onClick={onCreateNew}>
        Nueva área
      </Button>

      {activeAreas.length === 0 ? (
        <EmptyState
          title="Aún no tienes áreas de vida"
          description="Crea la primera cuando quieras nombrar lo que te importa."
          action={
            <Button type="button" variant="secondary" onClick={onCreateNew}>
              Crear área
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {activeAreas.map((area) => (
            <Card key={area.id} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <Body className="text-ink">{area.title}</Body>

                {area.inFocus ? (
                  <Caption className="whitespace-nowrap text-ink-faint">En foco</Caption>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onToggleFocus(area.id)}
                >
                  {area.inFocus ? "Quitar foco" : "Marcar en foco"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => onEdit(area)}>
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onToggleActive(area.id)}
                >
                  Archivar
                </Button>

                <ConfirmButton
                  label="Eliminar"
                  question="¿Eliminar esta área?"
                  onConfirm={() => onDelete(area.id)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {archivedAreas.length > 0 ? (
        <div className="space-y-3">
          <SectionTitle>Archivadas</SectionTitle>

          {archivedAreas.map((area) => (
            <Card key={area.id} className="space-y-3 opacity-60">
              <Body className="text-ink">{area.title}</Body>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => onEdit(area)}>
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onToggleActive(area.id)}
                >
                  Activar
                </Button>

                <ConfirmButton
                  label="Eliminar"
                  question="¿Eliminar esta área?"
                  onConfirm={() => onDelete(area.id)}
                />
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
