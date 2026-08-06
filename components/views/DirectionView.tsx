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
import { useStoredValue } from "@/lib/hooks/useStoredValue";
import { useHydrated } from "@/lib/hooks/useHydrated";

const EMPTY_DIRECTION: {
  direction: DirectionRevision | null;
  history: DirectionRevision[];
  areas: LifeArea[];
} = { direction: null, history: [], areas: [] };

type AreasMode = "list" | "form";

export default function DirectionView() {
  const hydrated = useHydrated();
  // The room they are writing in, recorded with what they write. Read here
  // rather than inside the storage layer: a view already knows this, and
  // reaching for it from a module that has no business touching the DOM is
  // what made the save path untestable.
  const { atmosphere } = useAtmosphere();
  // Read from the stores rather than kept alongside them: every write below
  // notifies, so these are always what is actually saved.
  const { direction, history, areas } = useStoredValue(
    () => ({
      direction: getLifeDirection(),
      history: getDirectionHistory(),
      areas: getLifeAreas(),
    }),
    EMPTY_DIRECTION,
  );
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
  };

  const handleToggleFocus = (id: string) => {
    updateLifeArea(id, (area) => ({ ...area, inFocus: !area.inFocus }));
  };

  const handleDeleteArea = (id: string) => {
    removeLifeArea(id);
    setJustDeletedAreaId(id);
  };

  const handleRestoreArea = (id: string) => {
    restoreLifeArea(id);
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

    closeForm();
  };

  const handleSaveDirection = (statement: string) => {
    // Returns null when nothing was appended — unchanged or empty text — in
    // which case nothing notifies and this screen stays exactly as still as
    // it was, which is the whole point of it.
    saveLifeDirection(statement, atmosphere);
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
