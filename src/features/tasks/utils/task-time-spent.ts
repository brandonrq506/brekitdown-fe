import type { Task } from "../types/task";
import { memoizeFormatter } from "./memoize-formatter";

const hourFormatter = memoizeFormatter(
  (locale?: string) =>
    new Intl.NumberFormat(locale, { style: "unit", unit: "hour", unitDisplay: "narrow" }),
);

const minuteFormatter = memoizeFormatter(
  (locale?: string) =>
    new Intl.NumberFormat(locale, { style: "unit", unit: "minute", unitDisplay: "narrow" }),
);

/** `type: "unit"` joins measurements the way the locale writes them, e.g. "2h 15m" in `en`. */
const unitListFormatter = memoizeFormatter(
  (locale?: string) => new Intl.ListFormat(locale, { style: "narrow", type: "unit" }),
);

/**
 * The time logged against a task. Only closed entries count: a running one has no end to measure,
 * and the card shows it as a Stop button instead.
 */
export const getTaskTimeSpent = (task: Pick<Task, "time_entries">): Temporal.Duration =>
  task.time_entries.reduce(
    (total, { started_at, ended_at }) =>
      ended_at === null
        ? total
        : total.add(Temporal.Instant.from(started_at).until(Temporal.Instant.from(ended_at))),
    new Temporal.Duration(),
  );

/**
 * Formats a logged duration as hours and minutes, dropping a zero hours part and truncating the
 * seconds so a task never reads as longer than it was.
 *
 * @param duration - A clock-time duration (no days, weeks, months or years), such as the one
 * {@link getTaskTimeSpent} returns.
 * @param locale - BCP 47 tag. Defaults to the runtime locale.
 * @returns "2h 15m", "2h" or "15m" in an English locale. A blank duration reads "0m".
 */
export const formatTaskTimeSpent = (duration: Temporal.Duration, locale?: string): string => {
  const { hours, minutes } = duration.round({
    largestUnit: "hour",
    smallestUnit: "minute",
    roundingMode: "trunc",
  });
  const parts: string[] = [];
  if (hours > 0) parts.push(hourFormatter(locale).format(hours));
  if (minutes > 0 || hours === 0) parts.push(minuteFormatter(locale).format(minutes));

  return unitListFormatter(locale).format(parts);
};
