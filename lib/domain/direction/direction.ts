export interface LifeDirection {
  statement: string;
  updatedAt: string;
}

export function createLifeDirection(): LifeDirection {
  return {
    statement: "",
    updatedAt: new Date().toISOString(),
  };
}
