import { getGreeting } from "./greeting";
import { getFormattedDate } from "./date";
import { getDailyReflection } from "./domain/reflections/daily-reflections";
import type { Today } from "./models/Today";

export function getToday(): Today {
  return {
    greeting: getGreeting(),
    date: getFormattedDate(),
    day: {
      reflection: getDailyReflection(),
    },
  };
}
