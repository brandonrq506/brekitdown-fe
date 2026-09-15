import { buildGoal, goal } from "@/test/store/goals";
import { buildTask, task } from "@/test/store/tasks";
import { buildTimeEntry, runningTimeEntry } from "@/test/store/time-entries";

const builders: [entity: string, build: () => object, storedFixture: object][] = [
  ["goal", buildGoal, goal],
  ["task", buildTask, task],
  ["time entry", buildTimeEntry, runningTimeEntry],
];

it.each(builders)("builds a %s that no other test can reach", (_entity, build, storedFixture) => {
  expect(build()).not.toBe(storedFixture);
  expect(build()).not.toBe(build());
});

it("builds tasks with independent nested collections", () => {
  const firstTask = buildTask();
  const secondTask = buildTask();

  expect(firstTask.tags).not.toBe(secondTask.tags);
  expect(firstTask.time_entries).not.toBe(secondTask.time_entries);
});
