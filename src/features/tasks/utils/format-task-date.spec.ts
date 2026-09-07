import { formatExactTaskDate, formatTaskDate } from "./format-task-date";

// A viewer six hours behind UTC, so the zone genuinely changes which day an instant lands on.
const zonedNow = (date: string) =>
  Temporal.ZonedDateTime.from(`${date}T09:00:00-06:00[America/Costa_Rica]`);

const now = zonedNow("2026-09-06");
const context = { now, locale: "en-US" };
const daysAway = (days: number) => now.add({ days }).toInstant().toString();

it("uses the locale's own word for the offsets it has one for", () => {
  expect(formatTaskDate(daysAway(0), context)).toBe("today");
  expect(formatTaskDate(daysAway(1), context)).toBe("tomorrow");
  expect(formatTaskDate(daysAway(-1), context)).toBe("yesterday");
  expect(formatTaskDate(daysAway(2), { now, locale: "es-ES" })).toBe("pasado mañana");
  expect(formatTaskDate(daysAway(-2), { now, locale: "de-DE" })).toBe("vorgestern");
});

it("names the weekday for the rest of the coming week and stops before it repeats", () => {
  expect(formatTaskDate(daysAway(2), context)).toBe("Tuesday");
  expect(formatTaskDate(daysAway(6), context)).toBe("Saturday");
  expect(formatTaskDate(daysAway(7), context)).toBe("Sep 13");
});

it("dates future values, adding the year only when it differs from today's", () => {
  expect(formatTaskDate(daysAway(20), context)).toBe("Sep 26");
  expect(formatTaskDate("2027-03-25T15:00:00Z", context)).toBe("Mar 25, 2027");
});

it("coarsens past values as they recede", () => {
  expect(formatTaskDate(daysAway(-6), context)).toBe("6 days ago");
  expect(formatTaskDate(daysAway(-7), context)).toBe("last week");
  expect(formatTaskDate(daysAway(-24), context)).toBe("last month");
  expect(formatTaskDate(daysAway(-62), context)).toBe("2 months ago");
});

it("counts weeks before months so a date days old is not called last month", () => {
  const firstOfSeptember = { now: zonedNow("2026-09-01"), locale: "en-US" };
  expect(formatTaskDate("2026-08-25T15:00:00Z", firstOfSeptember)).toBe("last week");
  expect(formatTaskDate("2026-08-20T15:00:00Z", firstOfSeptember)).toBe("last week");
  expect(formatTaskDate("2026-08-18T15:00:00Z", firstOfSeptember)).toBe("last month");
});

it("keeps a week count while both dates share a calendar month", () => {
  const twentiethOfSeptember = { now: zonedNow("2026-09-20"), locale: "en-US" };
  expect(formatTaskDate("2026-09-06T15:00:00Z", twentiethOfSeptember)).toBe("2 weeks ago");
  expect(formatTaskDate("2026-08-31T15:00:00Z", twentiethOfSeptember)).toBe("last month");

  const endOfSeptember = { now: zonedNow("2026-09-30"), locale: "en-US" };
  expect(formatTaskDate("2026-09-01T15:00:00Z", endOfSeptember)).toBe("4 weeks ago");
});

it("counts calendar years back rather than twelve-month blocks", () => {
  const firstOfSeptember = { now: zonedNow("2026-09-01"), locale: "en-US" };
  expect(formatTaskDate("2025-10-01T15:00:00Z", firstOfSeptember)).toBe("11 months ago");
  expect(formatTaskDate("2025-09-30T15:00:00Z", firstOfSeptember)).toBe("last year");
  expect(formatTaskDate("2024-12-31T15:00:00Z", firstOfSeptember)).toBe("2 years ago");
});

it("resolves the day in the viewer's zone rather than UTC", () => {
  expect(formatTaskDate("2026-09-07T03:00:00Z", context)).toBe("today");
  expect(formatTaskDate("2026-09-07T06:00:00Z", context)).toBe("tomorrow");
});

it("counts the viewer's own midnight as today", () => {
  // 06:00Z is exactly 00:00 in America/Costa_Rica, so it is the first instant of today.
  expect(formatTaskDate("2026-09-06T06:00:00Z", context)).toBe("today");
  expect(formatTaskDate("2026-09-06T05:59:59.999999999Z", context)).toBe("yesterday");
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
  const yearEnd = { now: zonedNow("2026-12-30"), locale: "en-US" };
  expect(formatTaskDate("2027-01-01T15:00:00Z", yearEnd)).toBe("Friday");
  expect(formatTaskDate("2027-01-06T15:00:00Z", yearEnd)).toBe("Jan 6, 2027");
});

it("accepts a viewer clock on any calendar", () => {
  const hebrew = { now: now.withCalendar("hebrew"), locale: "en-US" };
  expect(formatTaskDate(daysAway(2), hebrew)).toBe("Tuesday");
  expect(formatTaskDate(daysAway(-24), hebrew)).toBe("last month");
});

it("exposes the exact instant behind the label", () => {
  expect(formatExactTaskDate("2026-09-06T18:00:00Z", context)).toBe(
    "Sunday, September 6, 2026 at 12:00 PM",
  );
  expect(formatExactTaskDate("2026-09-06T18:00:00Z", { now, locale: "en-GB" })).toBe(
    "Sunday, 6 September 2026 at 12:00",
  );
});

it("rejects a value that is not an instant", () => {
  expect(() => formatTaskDate("2026-09-06", context)).toThrow(RangeError);
  expect(() => formatTaskDate("2026-09-06T18:00:00", context)).toThrow(RangeError);
  expect(() => formatExactTaskDate("not a date", context)).toThrow(RangeError);
});

it("rejects an invalid locale regardless of what was cached before it", () => {
  expect(formatTaskDate(daysAway(20), context)).toBe("Sep 26");
  expect(() => formatTaskDate(daysAway(20), { now, locale: "" })).toThrow(RangeError);
});
