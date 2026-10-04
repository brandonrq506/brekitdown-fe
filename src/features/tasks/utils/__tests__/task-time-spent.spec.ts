import { formatTaskTimeSpent, getTaskTimeSpent } from "../task-time-spent";
import { buildTimeEntry } from "@/test/store/time-entries";

const closedEntry = (started_at: string, ended_at: string) =>
  buildTimeEntry({ reference_xid: `${started_at}-${ended_at}`, started_at, ended_at });

it("sums the closed time entries", () => {
  const timeSpent = getTaskTimeSpent({
    time_entries: [
      closedEntry("2026-09-12T09:00:00Z", "2026-09-12T10:30:00Z"),
      closedEntry("2026-09-13T09:00:00Z", "2026-09-13T09:45:00Z"),
    ],
  });

  expect(timeSpent.total("minute")).toBe(135);
});

it("leaves a running entry out", () => {
  const timeSpent = getTaskTimeSpent({
    time_entries: [
      closedEntry("2026-09-12T09:00:00Z", "2026-09-12T10:00:00Z"),
      buildTimeEntry({ started_at: "2026-09-13T09:00:00Z", ended_at: null }),
    ],
  });

  expect(timeSpent.total("minute")).toBe(60);
});

it("is blank without closed entries", () => {
  expect(getTaskTimeSpent({ time_entries: [] }).blank).toBe(true);
});

it.each<[duration: Temporal.DurationLike, label: string]>([
  [{ hours: 2, minutes: 15 }, "2h 15m"],
  [{ hours: 2 }, "2h"],
  [{ minutes: 45 }, "45m"],
  [{ minutes: 90 }, "1h 30m"],
  [{ minutes: 59, seconds: 59 }, "59m"],
  [{ seconds: 30 }, "0m"],
])("formats %j as %s", (duration, label) => {
  expect(formatTaskTimeSpent(Temporal.Duration.from(duration), "en-US")).toBe(label);
});

it("reads a blank duration as 0m", () => {
  expect(formatTaskTimeSpent(new Temporal.Duration(), "en-US")).toBe("0m");
});
