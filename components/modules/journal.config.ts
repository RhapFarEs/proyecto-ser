import type { ComponentType } from "react";

import JournalNotesModule from "./JournalNotesModule";
import JournalPromptModule from "./JournalPromptModule";
import JournalWelcomeModule from "./JournalWelcomeModule";
import type { JournalEntry } from "@/lib/domain/entry/entry";

export interface JournalModuleProps {
  todayNotes?: JournalEntry[];
  onSaveNote?: (mood: string, content: string) => void;
  onDeleteNote?: (noteId: string) => void;
}

export interface JournalModule {
  id: string;
  title: string;
  order: number;
  enabled: boolean;
  component: ComponentType<JournalModuleProps>;
}

const journalModules: JournalModule[] = [
  {
    id: "welcome",
    title: "Welcome",
    order: 0,
    enabled: true,
    component: JournalWelcomeModule,
  },
  {
    id: "prompt",
    title: "Prompt",
    order: 1,
    enabled: true,
    component: JournalPromptModule,
  },
  {
    id: "notes",
    title: "Notes",
    order: 2,
    enabled: true,
    component: JournalNotesModule,
  },
];

export default journalModules;
