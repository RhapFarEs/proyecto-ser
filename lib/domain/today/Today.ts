import type { Day } from "./Day";

export type Today = {
  greeting: string;

  date: string;

  progress: {
    week: number;
    day: number;
    title: string;
  };

  day: Day;
};
