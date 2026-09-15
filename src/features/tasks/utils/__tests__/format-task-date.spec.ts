import { formatExactTaskDate, formatTaskDate } from "../format-task-date";

// A viewer six hours behind UTC, so the zone genuinely changes which day an instant lands on.
const viewerOn = (date: string) => ({
  now: Temporal.ZonedDateTime.from(`${date}T09:00:00-06:00[America/Costa_Rica]`),
  locale: "en-US",
});

const sixthOfSeptember = viewerOn("2026-09-06");
const daysAway = (days: number) => sixthOfSeptember.now.add({ days }).toInstant().toString();

// CLDR stores a word only for the day offsets a locale actually has one for: `en` stops at ±1,
// while `es` and `de` reach ±2.
it.each<[days: number, word: string, locale: string]>([
  [0, "today", "en-US"],
  [1, "tomorrow", "en-US"],
  [-1, "yesterday", "en-US"],
  [2, "pasado mañana", "es-ES"],
  [-2, "vorgestern", "de-DE"],
])("calls a date %d days away %s in %s", (days, word, locale) => {
  expect(formatTaskDate(daysAway(days), { ...sixthOfSeptember, locale })).toBe(word);
});

it("names the weekday for the rest of the coming week", () => {
  expect(formatTaskDate(daysAway(2), sixthOfSeptember)).toBe("Tuesday");
  expect(formatTaskDate(daysAway(6), sixthOfSeptember)).toBe("Saturday");
});

it("dates a day a week out rather than repeating a weekday name", () => {
  expect(formatTaskDate(daysAway(7), sixthOfSeptember)).toBe("Sep 13");
});

it("dates a future value without a year while it stays in today's", () => {
  expect(formatTaskDate(daysAway(20), sixthOfSeptember)).toBe("Sep 26");
});

it("adds the year to a future value that falls in another one", () => {
  expect(formatTaskDate("2027-03-25T15:00:00Z", sixthOfSeptember)).toBe("Mar 25, 2027");
});

it("coarsens past values as they recede", () => {
  expect(formatTaskDate(daysAway(-6), sixthOfSeptember)).toBe("6 days ago");
  expect(formatTaskDate(daysAway(-7), sixthOfSeptember)).toBe("last week");
  expect(formatTaskDate(daysAway(-24), sixthOfSeptember)).toBe("last month");
  expect(formatTaskDate(daysAway(-62), sixthOfSeptember)).toBe("2 months ago");
});

it("counts weeks before months so a date days old is not called last month", () => {
  const firstOfSeptember = viewerOn("2026-09-01");

  expect(formatTaskDate("2026-08-25T15:00:00Z", firstOfSeptember)).toBe("last week");
  expect(formatTaskDate("2026-08-20T15:00:00Z", firstOfSeptember)).toBe("last week");
});

it("reaches for the calendar month once a past date is a fortnight old", () => {
  const firstOfSeptember = viewerOn("2026-09-01");

  expect(formatTaskDate("2026-08-18T15:00:00Z", firstOfSeptember)).toBe("last month");
});

it("keeps a week count while both dates share a calendar month", () => {
  const twentiethOfSeptember = viewerOn("2026-09-20");

  expect(formatTaskDate("2026-09-06T15:00:00Z", twentiethOfSeptember)).toBe("2 weeks ago");
});

it("calls a past date last month as soon as it fell in the previous one", () => {
  const twentiethOfSeptember = viewerOn("2026-09-20");

  expect(formatTaskDate("2026-08-31T15:00:00Z", twentiethOfSeptember)).toBe("last month");
});

it("still counts weeks for a date nearly a month old in the month it shares", () => {
  const endOfSeptember = viewerOn("2026-09-30");

  expect(formatTaskDate("2026-09-01T15:00:00Z", endOfSeptember)).toBe("4 weeks ago");
});

it("counts calendar years back rather than twelve-month blocks", () => {
  const firstOfSeptember = viewerOn("2026-09-01");

  expect(formatTaskDate("2025-10-01T15:00:00Z", firstOfSeptember)).toBe("11 months ago");
  expect(formatTaskDate("2025-09-30T15:00:00Z", firstOfSeptember)).toBe("last year");
  expect(formatTaskDate("2024-12-31T15:00:00Z", firstOfSeptember)).toBe("2 years ago");
});

it("resolves the day in the viewer's zone rather than UTC", () => {
  expect(formatTaskDate("2026-09-07T03:00:00Z", sixthOfSeptember)).toBe("today");
  expect(formatTaskDate("2026-09-07T06:00:00Z", sixthOfSeptember)).toBe("tomorrow");
});

it("counts the viewer's own midnight as today", () => {
  // 06:00Z is exactly 00:00 in America/Costa_Rica, so it is the first instant of today.
  expect(formatTaskDate("2026-09-06T06:00:00Z", sixthOfSeptember)).toBe("today");
  expect(formatTaskDate("2026-09-06T05:59:59.999999999Z", sixthOfSeptember)).toBe("yesterday");
});

it("starts the day at the first midnight when a DST fall-back repeats it", () => {
  // Havana leaves DST at 01:00-04:00 on this date, so 00:00 local happens at 04:00Z and again
  // at 05:00Z. Only the earlier one begins the day.
  const havana = {
    now: Temporal.ZonedDateTime.from("2020-11-01T12:00:00-05:00[America/Havana]"),
    locale: "en-US",
  };

  expect(formatTaskDate("2020-11-01T04:30:00Z", havana)).toBe("today");
  expect(formatTaskDate("2020-11-01T03:30:00Z", havana)).toBe("yesterday");
});

it("resolves the day in zones offset by part of an hour", () => {
  const kathmandu = {
    now: Temporal.ZonedDateTime.from("2026-09-06T12:00:00+05:45[Asia/Kathmandu]"),
    locale: "en-US",
  };

  expect(formatTaskDate("2026-09-05T18:20:00Z", kathmandu)).toBe("today");
  expect(formatTaskDate("2026-09-05T18:10:00Z", kathmandu)).toBe("yesterday");
});

it("crosses the year boundary without losing the weekday", () => {
  const thirtiethOfDecember = viewerOn("2026-12-30");

  expect(formatTaskDate("2027-01-01T15:00:00Z", thirtiethOfDecember)).toBe("Friday");
});

it("adds the coming year to a date just past the weekday window", () => {
  const thirtiethOfDecember = viewerOn("2026-12-30");

  expect(formatTaskDate("2027-01-06T15:00:00Z", thirtiethOfDecember)).toBe("Jan 6, 2027");
});

it("accepts a viewer clock on any calendar", () => {
  const hebrewViewer = { ...sixthOfSeptember, now: sixthOfSeptember.now.withCalendar("hebrew") };

  expect(formatTaskDate(daysAway(2), hebrewViewer)).toBe("Tuesday");
  expect(formatTaskDate(daysAway(-24), hebrewViewer)).toBe("last month");
});

it.each<[locale: string, exactDate: string]>([
  ["en-US", "Sunday, September 6, 2026 at 12:00 PM"],
  ["en-GB", "Sunday, 6 September 2026 at 12:00"],
])("exposes the exact instant behind the label in %s", (locale, exactDate) => {
  expect(formatExactTaskDate("2026-09-06T18:00:00Z", { ...sixthOfSeptember, locale })).toBe(
    exactDate,
  );
});

it("rejects a value that is not an instant", () => {
  expect(() => formatTaskDate("2026-09-06", sixthOfSeptember)).toThrow(RangeError);
  expect(() => formatTaskDate("2026-09-06T18:00:00", sixthOfSeptember)).toThrow(RangeError);
});

it("rejects a value that is not an instant when revealing the exact date", () => {
  expect(() => formatExactTaskDate("not a date", sixthOfSeptember)).toThrow(RangeError);
});

it("rejects an invalid locale regardless of what was cached before it", () => {
  // The formatters are memoized, so prime the cache with a valid locale first.
  formatTaskDate(daysAway(20), sixthOfSeptember);

  expect(() => formatTaskDate(daysAway(20), { ...sixthOfSeptember, locale: "" })).toThrow(
    RangeError,
  );
});
