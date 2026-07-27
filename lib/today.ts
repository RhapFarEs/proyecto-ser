import { getGreeting } from "./greeting";
import { getFormattedDate } from "./date";
import { getDailyReflection } from "./domain/reflections/daily-reflections";
import type { Today } from "./models/Today";

/**
 * `ownLines` are the person's own eligible sentences, gathered by the caller
 * (see `TodayView`) and mixed into the same pool as the product's own
 * collection. Empty on a new installation, which is why a new installation
 * speaks entirely in the product's voice and an old one mostly does not.
 */
export function getToday(ownLines: string[] = []): Today {
  const reflection = getDailyReflection(undefined, ownLines);

  return {
    greeting: getGreeting(),
    date: getFormattedDate(),
    day: {
      reflection: reflection.text,
      reflectionIsOwn: reflection.isOwn,
    },
  };
}
