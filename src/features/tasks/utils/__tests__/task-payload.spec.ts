import { toCreateTaskPayload } from "../task-payload";

it("trims the submitted values into a root task for the current goal", () => {
  expect(
    toCreateTaskPayload({ name: "  Outline  ", description: "  First\nSecond  " }, "goal_01"),
  ).toEqual({
    task: { name: "Outline", description: "First\nSecond", goal_reference_xid: "goal_01" },
  });
});

it.each<[label: string, description: string]>([
  ["an empty description", ""],
  ["a description of only spaces", "   "],
])("sends %s as an empty string", (_label, description) => {
  expect(toCreateTaskPayload({ name: "Outline", description }, "goal_01")).toEqual({
    task: { name: "Outline", description: "", goal_reference_xid: "goal_01" },
  });
});
