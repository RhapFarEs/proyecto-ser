export interface LifeArea {
  id: string;
  title: string;
  whyItMatters: string;
  active: boolean;
  inFocus: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function createLifeArea(title: string, whyItMatters: string): LifeArea {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title,
    whyItMatters,
    active: true,
    inFocus: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}
