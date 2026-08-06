"use client";

import { useState } from "react";

import Page from "@/components/ui/Page";
import DirectionStatementModule from "@/components/modules/DirectionStatementModule";
import LifeAreaListModule from "@/components/modules/LifeAreaListModule";
import LifeAreaFormModule, {
  type LifeAreaFormValues,
} from "@/components/modules/LifeAreaFormModule";
import {
  getDirectionHistory,
  getLifeDirection,
  saveLifeDirection,
} from "@/lib/domain/direction/direction-storage";
import type { DirectionRevision } from "@/lib/domain/direction/direction";
import { useAtmosphere } from "@/components/atmosphere/AtmosphereContext";
import { createLifeArea, type LifeArea } from "@/lib/domain/life-area/life-area";
import {
  getLifeAreas,
  removeLifeArea,
  restoreLifeArea,
  saveLifeArea,
  updateLifeArea,
} from "@/lib/domain/life-area/life-area-storage";
import { useClientState } from "@/lib/hooks/useClientState";
import { useHydrated } from "@/lib/hooks/useHydrated";

type AreasMode = "list" | "form";

export default function DirectionView() {
  const hydrated = useHydrated();
  // The room they are writing in, recorded with what they write. Read here
  // rather than inside the storage layer: a view already knows this, and
  // reaching for it from a module that has no business touching the DOM is
  // what made the save path untestable.
  const { atmosphere } = useAtmosphere();
  const [direction, setDirection] = useClientState<DirectionRevision | null>(
    () => getLifeDirection(),
    null,
  );
  const [history, setHistory] = useClientState<DirectionRevision[]>(
    () => getDirectionHistory(),
    [],
  );
  const [areas, setAreas] = useClientState<LifeArea[]>(() => getLifeAreas(), []);
  const [mode, setMode] = useState<AreasMode>("list");
  const [editingArea, setEditingArea] = useState<LifeArea | null>(null);
  const [justDeletedAreaId, setJustDeletedAreaId] = useState<string | null>(null);

  const openCreateForm = () => {
    setEditingArea(null);
    setMode("form");
  };

  const openEditForm = (area: LifeArea) => {
    setEditingArea(area);
    setMode("form");
  };

  const closeForm = () => {
    setEditingArea(null);
    setMode("list");
  };

  const handleToggleActive = (id: string) => {
    updateLifeArea(id, (area) => ({ ...area, active: !area.active }));
    setAreas(getLifeAreas());
  };

  const handleToggleFocus = (id: string) => {
    updateLifeArea(id, (area) => ({ ...area, inFocus: !area.inFocus }));
    setAreas(getLifeAreas());
  };

  const handleDeleteArea = (id: string) => {
    removeLifeArea(id);
    setAreas(getLifeAreas());
    setJustDeletedAreaId(id);
  };

  const handleRestoreArea = (id: string) => {
    restoreLifeArea(id);
    setAreas(getLifeAreas());
    setJustDeletedAreaId(null);
  };

  const handleSubmitArea = (values: LifeAreaFormValues) => {
    if (editingArea) {
      updateLifeArea(editingArea.id, (area) => ({
        ...area,
        title: values.title,
        whyItMatters: values.whyItMatters,
      }));
    } else {
      saveLifeArea(createLifeArea(values.title, values.whyItMatters));
    }

    setAreas(getLifeAreas());
    closeForm();
  };

  const handleSaveDirection = (statement: string) => {
    // Null means nothing was appended — unchanged or empty text. Re-reading
    // then would rebuild identical state for no reason, and would push a
    // pointless render through a screen whose whole job is to feel still.
    if (!saveLifeDirection(statement, atmosphere)) {
      return;
    }

    setDirection(getLifeDirection());
    setHistory(getDirectionHistory());
  };

  return (
    <Page
      title="Dirección personal"
      subtitle="Un lugar tranquilo para recordar lo que te importa."
    >
      <DirectionStatementModule
        key={`statement:${hydrated}`}
        statement={direction?.statement ?? ""}
        history={history}
        onSave={handleSaveDirection}
      />

      {mode === "list" ? (
        <LifeAreaListModule
          areas={areas}
          onCreateNew={openCreateForm}
          onEdit={openEditForm}
          onToggleActive={handleToggleActive}
          onToggleFocus={handleToggleFocus}
          onDelete={handleDeleteArea}
          justDeletedId={justDeletedAreaId}
          onRestore={handleRestoreArea}
          onDismissUndo={() => setJustDeletedAreaId(null)}
        />
      ) : (
        <LifeAreaFormModule area={editingArea} onSubmit={handleSubmitArea} onCancel={closeForm} />
      )}
    </Page>
  );
}
