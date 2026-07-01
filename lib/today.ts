import { getGreeting } from "./greeting";
import { getFormattedDate } from "./date";
import { getCurrentProgress } from "./progress";
import { getCurrentDay } from "./day";
import type { Today } from "./models/Today";

export function getToday(): Today {
  return {
    greeting: getGreeting(),
    date: getFormattedDate(),
    progress: getCurrentProgress(),
    day: getCurrentDay(),
  };
}