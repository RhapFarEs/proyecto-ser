"use client";

import { useState } from "react";

import Page from "@/components/ui/Page";
import DirectionStatementModule from "@/components/modules/DirectionStatementModule";
import LifeAreaListModule from "@/components/modules/LifeAreaListModule";
import LifeAreaFormModule, {
  type LifeAreaFormValues,
} from "@/components/modules/LifeAreaFormModule";
import { getLifeDirection, saveLifeDirection } from "@/lib/domain/direction/direction-storage";
import { createLifeDirection, type LifeDirection } from "@/lib/domain/direction/direction";
import { createLifeArea, type LifeArea } from "@/lib/domain/life-area/life-area";
import {
  getLifeAreas,
  saveLifeArea,
  updateLifeArea,
} from "@/lib/domain/life-area/life-area-storage";
import { useClientState } from "@/lib/hooks/useClientState";
import { useHydrated } from "@/lib/hooks/useHydrated";

type AreasMode = "list" | "form";

export default function DirectionView() {
  const hydrated = useHydrated();
  const [direction] = useClientState<LifeDirection>(
    () => getLifeDirection(),
    createLifeDirection(),
  );
  const [areas, setAreas] = useClientState<LifeArea[]>(() => getLifeAreas(), []);
  const [mode, setMode] = useState<AreasMode>("list");
  const [editingArea, setEditingArea] = useState<LifeArea | null>(null);

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
    saveLifeDirection(statement);
  };

  return (
    <Page title="Dirección" subtitle="Un lugar tranquilo para recordar lo que te importa.">
      <DirectionStatementModule
        key={`statement:${hydrated}`}
        statement={direction.statement}
        onSave={handleSaveDirection}
      />

      {mode === "list" ? (
        <LifeAreaListModule
          areas={areas}
          onCreateNew={openCreateForm}
          onEdit={openEditForm}
          onToggleActive={handleToggleActive}
          onToggleFocus={handleToggleFocus}
        />
      ) : (
        <LifeAreaFormModule area={editingArea} onSubmit={handleSubmitArea} onCancel={closeForm} />
      )}
    </Page>
  );
}
