/**
 * View model for the Today screen's header modules (greeting + daily
 * reflection). Formerly re-exported from a parallel `lib/domain/today`
 * tree and carried an unused hardcoded `progress` field — both removed;
 * this file is now the single definition.
 */
export type Today = {
  greeting: string;
  date: string;
  day: {
    reflection: string;
    /**
     * Whether today's line came from the person's own writing rather than
     * the product's collection. Only changes the label under it — the line
     * itself is presented the same either way.
     */
    reflectionIsOwn: boolean;
  };
};
