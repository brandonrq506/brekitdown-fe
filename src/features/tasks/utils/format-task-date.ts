/** Every date here is normalised to ISO 8601, so the week and year lengths are fixed. */
const DAYS_IN_ISO_WEEK = 7;
const MONTHS_IN_ISO_YEAR = 12;
/** A weekday name only points at one date while the window is shorter than a week. */
const UPCOMING_WEEKDAY_LIMIT = DAYS_IN_ISO_WEEK - 1;
/** Under a fortnight a week count describes a past date best; past it, the calendar month does. */
const WEEKS_BEFORE_MONTH_BUCKETS = 2;

export interface TaskDateContext {
  /** The viewer's clock and time zone, on any calendar. Defaults to the system's. */
  now?: Temporal.ZonedDateTime;
  /** BCP 47 tag. Defaults to the runtime locale. */
  locale?: string;
}

/**
 * Constructing an `Intl` formatter costs tens of times what using one does, which is why MDN's
 * guidance is to keep them. Locale and time zone are parameters here, so "keep one" becomes
 * "keep one per distinct set of construction arguments".
 */
const memoizeFormatter = <TArguments extends readonly (string | undefined)[], TFormatter>(
  create: (...formatterArguments: TArguments) => TFormatter,
) => {
  const cache = new Map<string, TFormatter>();
  return (...formatterArguments: TArguments): TFormatter => {
    // Serialised rather than joined, so an explicit "" locale cannot collide with `undefined`
    // and make the result depend on which call happened to populate the cache first.
    const key = JSON.stringify(formatterArguments);
    const cached = cache.get(key);
    if (cached !== undefined) return cached;

    const formatter = create(...formatterArguments);
    cache.set(key, formatter);
    return formatter;
  };
};

const relativeFormatter = memoizeFormatter(
  (locale?: string) => new Intl.RelativeTimeFormat(locale, { numeric: "auto" }),
);

/**
 * The date formatters render an instant and each carries the viewer's zone, because TypeScript's
 * `Intl.DateTimeFormat.format` accepts only `number | Date` even though the runtime also accepts
 * `Temporal.Instant`. Do not "fix" the types by passing a `Temporal.PlainDate`: besides not
 * compiling, it selects a different CLDR pattern in CJK locales, where `ja-JP` renders `2025/12/31`
 * instead of `2025年12月31日`. Passing the zone explicitly keeps every string on the calendar day
 * the branch logic chose.
 */
const weekdayFormatter = memoizeFormatter(
  (locale: string | undefined, timeZone: string) =>
    new Intl.DateTimeFormat(locale, { weekday: "long", timeZone }),
);

const monthAndDayFormatter = memoizeFormatter(
  (locale: string | undefined, timeZone: string) =>
    new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone }),
);

const monthDayAndYearFormatter = memoizeFormatter(
  (locale: string | undefined, timeZone: string) =>
    new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", timeZone }),
);

const exactFormatter = memoizeFormatter(
  (locale: string | undefined, timeZone: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short", timeZone }),
);

/**
 * `Temporal.Now.zonedDateTimeISO()` is the idiomatic call, but Vitest's fake timers cannot
 * replace `Temporal.Now` yet, only `Date`. Reading the clock through `Date.now()` keeps
 * `vi.setSystemTime` in control of what "today" means; swap back once Vitest ships the
 * `@sinonjs/fake-timers` version that lists `"Temporal"` in `toFake`.
 */
const systemNow = (): Temporal.ZonedDateTime =>
  Temporal.Instant.fromEpochMilliseconds(Date.now()).toZonedDateTimeISO(Temporal.Now.timeZoneId());

/** The calendar day an instant falls on for this viewer, which is what every label describes. */
const viewerDate = (instant: Temporal.Instant, now: Temporal.ZonedDateTime): Temporal.PlainDate =>
  instant.toZonedDateTimeISO(now.timeZoneId).toPlainDate();

/**
 * CLDR stores a word only for the day offsets a locale actually has one for: `en` stops at ±1,
 * `es`/`de`/`ja` reach ±2. A single literal part means the lookup hit; anything else is a
 * counted phrase such as "in 4 days".
 */
const relativeDayWord = (dayDifference: number, locale: string | undefined): string | null => {
  const parts = relativeFormatter(locale).formatToParts(dayDifference, "day");
  const [word] = parts;
  return parts.length === 1 && word?.type === "literal" ? word.value : null;
};

/**
 * Calendar months apart, not months elapsed. From September 6 both August 13 and August 20 sit in
 * last month, while `until(…, { largestUnit: "month" })` reports 0 for both because neither has
 * completed a full month. The bucket is therefore calendar-relative: a 29-day-old date can read
 * "2 months ago" from the 1st while a 30-day-old one reads "4 weeks ago" from the 31st.
 */
const calendarMonthsBetween = (from: Temporal.PlainDate, to: Temporal.PlainDate): number =>
  (to.year - from.year) * MONTHS_IN_ISO_YEAR + (to.month - from.month);

/**
 * How coarsely a past date should be described. The day and week tiers run first: without them a
 * date one week back would be called "last month" merely for sitting in a different one. Past a
 * fortnight the calendar month is the better bucket, so a week count only survives while both
 * dates share a month. Years are counted the same deictic way: "last year" means the previous
 * calendar year, not any twelve-month block.
 */
const elapsedAmount = (
  date: Temporal.PlainDate,
  today: Temporal.PlainDate,
): readonly [count: number, unit: Intl.RelativeTimeFormatUnit] => {
  const daysBehind = date.until(today, { largestUnit: "day" }).days;
  if (daysBehind < DAYS_IN_ISO_WEEK) return [-daysBehind, "day"];

  const weeksBehind = Math.trunc(daysBehind / DAYS_IN_ISO_WEEK);
  if (weeksBehind < WEEKS_BEFORE_MONTH_BUCKETS) return [-weeksBehind, "week"];

  const monthsBehind = calendarMonthsBetween(date, today);
  if (monthsBehind >= MONTHS_IN_ISO_YEAR) return [-(today.year - date.year), "year"];
  if (monthsBehind >= 1) return [-monthsBehind, "month"];
  return [-weeksBehind, "week"];
};

/** A past date answers "how long ago", so its label coarsens as the date recedes. */
const formatElapsed = (
  instant: Temporal.Instant,
  now: Temporal.ZonedDateTime,
  locale: string | undefined,
): string =>
  relativeFormatter(locale).format(...elapsedAmount(viewerDate(instant, now), now.toPlainDate()));

/**
 * A future date answers "which day", so it stays specific: the locale's own word for the offset
 * while it has one, a weekday name for the rest of the coming week, then a date. The year is
 * compared in ISO while the label renders the locale's calendar, so a locale whose calendar
 * disagrees with the Gregorian year boundary (`fa-IR` resolves to the Persian calendar by
 * default) can omit a year that did change for its reader.
 */
const formatUpcoming = (
  instant: Temporal.Instant,
  now: Temporal.ZonedDateTime,
  locale: string | undefined,
): string => {
  const timeZone = now.timeZoneId;
  const date = viewerDate(instant, now);
  const today = now.toPlainDate();
  const dayDifference = today.until(date, { largestUnit: "day" }).days;
  const word = relativeDayWord(dayDifference, locale);
  if (word !== null) return word;

  const { epochMilliseconds } = instant;
  if (dayDifference <= UPCOMING_WEEKDAY_LIMIT) {
    return weekdayFormatter(locale, timeZone).format(epochMilliseconds);
  }
  return date.year === today.year
    ? monthAndDayFormatter(locale, timeZone).format(epochMilliseconds)
    : monthDayAndYearFormatter(locale, timeZone).format(epochMilliseconds);
};

/**
 * Formats a task timestamp as the shortest label that still answers the question being asked of
 * it: how long ago for a past date, which day for a future one.
 *
 * @param timestamp - An ISO 8601 instant from the API, such as `"2026-09-06T18:00:00Z"`. Any
 * bracketed time zone annotation is ignored in favour of the viewer's own.
 * @param context - The viewer's clock, time zone and locale. Defaults to the system's.
 * @returns A coarsening relative phrase for past dates. For future dates, the locale's own word
 * for the offset, a weekday name for the rest of the coming week, otherwise the month and day,
 * plus the year when it differs from today's.
 * @throws {RangeError} When `timestamp` is not a valid ISO 8601 instant, or `context.locale` is
 * not a valid BCP 47 tag.
 *
 * @example
 * ```ts
 * formatTaskDate("2026-08-13T18:00:00Z");
 * // "last month" on September 6, 2026 in an English locale
 * ```
 */
export const formatTaskDate = (
  timestamp: string,
  { now = systemNow(), locale }: TaskDateContext = {},
): string => {
  const instant = Temporal.Instant.from(timestamp);
  // The viewer's day is read in ISO, so normalise the clock too: `until` refuses to mix calendars.
  const viewerNow = now.withCalendar("iso8601");
  // `startOfDay` rather than a literal midnight: on a DST fall-back 00:00 happens twice, and this
  // is the documented way to get the first one without depending on the offset `now` carries.
  const isPast = Temporal.Instant.compare(instant, viewerNow.startOfDay().toInstant()) < 0;

  return isPast
    ? formatElapsed(instant, viewerNow, locale)
    : formatUpcoming(instant, viewerNow, locale);
};

/**
 * The unabbreviated date and time behind {@link formatTaskDate}'s label, so "last month" stays
 * recoverable without opening the task.
 *
 * @param timestamp - An ISO 8601 instant from the API, such as `"2026-09-06T18:00:00Z"`.
 * @param context - The viewer's clock, time zone and locale. Defaults to the system's.
 * @throws {RangeError} When `timestamp` is not a valid ISO 8601 instant, or `context.locale` is
 * not a valid BCP 47 tag.
 */
export const formatExactTaskDate = (
  timestamp: string,
  { now = systemNow(), locale }: TaskDateContext = {},
): string =>
  exactFormatter(locale, now.timeZoneId).format(Temporal.Instant.from(timestamp).epochMilliseconds);
