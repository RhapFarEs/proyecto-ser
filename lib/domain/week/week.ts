export interface WeeklyReflection {
  wentWell: string;
  difficult: string;
  nextWeekFocus: string;
}

export interface Week {
  id: string;
  reflection: WeeklyReflection;
  /** References a LifeArea by id. Never store its title/description here — resolve at render time. */
  focusLifeAreaId?: string;
  updatedAt: string;
}

export function createWeek(id: string): Week {
  return {
    id,
    reflection: { wentWell: "", difficult: "", nextWeekFocus: "" },
    updatedAt: new Date().toISOString(),
  };
}
