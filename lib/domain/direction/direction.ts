// Direction is a singleton per user — there is only ever one, so it
// always lives under this fixed id rather than a generated one.
export const LIFE_DIRECTION_ID = "direction";

export interface LifeDirection {
  id: string;
  statement: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function createLifeDirection(): LifeDirection {
  const now = new Date().toISOString();

  return {
    id: LIFE_DIRECTION_ID,
    statement: "",
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}
