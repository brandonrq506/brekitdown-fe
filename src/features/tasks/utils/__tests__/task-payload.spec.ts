import { toCreateTaskPayload } from "../task-payload";

it("trims the submitted values", () => {
  expect(
    toCreateTaskPayload({ name: "  Outline  ", description: "  First\nSecond  " }, "goal_01"),
  ).toEqual({
    task: { name: "Outline", description: "First\nSecond", goal_reference_xid: "goal_01" },
  });
});

it("keeps an empty description as an empty string", () => {
  expect(toCreateTaskPayload({ name: "Outline", description: "" }, "goal_01")).toEqual({
    task: { name: "Outline", description: "", goal_reference_xid: "goal_01" },
  });
});

it("sends a whitespace-only description as an empty string", () => {
  expect(toCreateTaskPayload({ name: "Outline", description: "   " }, "goal_01")).toEqual({
    task: { name: "Outline", description: "", goal_reference_xid: "goal_01" },
  });
});
