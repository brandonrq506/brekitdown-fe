import { endOfLocalDay } from "../task-due-date";
import { toCreateTaskPayload } from "../task-payload";

it("trims the submitted values into a root task for the current goal", () => {
  expect(
    toCreateTaskPayload(
      { name: "  Outline  ", description: "  First\nSecond  ", dueAt: null },
      "goal_01",
    ),
  ).toEqual({
    task: {
      name: "Outline",
      description: "First\nSecond",
      due_at: null,
      goal_reference_xid: "goal_01",
    },
  });
});

it.each<[label: string, description: string]>([
  ["an empty description", ""],
  ["a description of only spaces", "   "],
])("sends %s as an empty string", (_label, description) => {
  expect(toCreateTaskPayload({ name: "Outline", description, dueAt: null }, "goal_01")).toEqual({
    task: {
      name: "Outline",
      description: "",
      due_at: null,
      goal_reference_xid: "goal_01",
    },
  });
});

it("serializes the resolved deadline", () => {
  const payload = toCreateTaskPayload(
    {
      name: "Outline",
      description: "",
      dueAt: new Date("2026-09-21T05:59:59Z"),
    },
    "goal_01",
  );

  expect(payload.task.due_at).toBe("2026-09-21T05:59:59.000Z");
});

it.each<[date: string, expected: string]>([
  ["2026-03-08", "2026-03-09T03:59:59.000Z"],
  ["2026-11-01", "2026-11-02T04:59:59.000Z"],
])("uses the timezone offset at the end of DST date %s", (date, expected) => {
  vi.stubEnv("TZ", "America/New_York");

  expect(endOfLocalDay(new Date(`${date}T00:00:00`)).toISOString()).toBe(expected);
});
