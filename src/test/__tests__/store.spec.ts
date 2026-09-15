import { buildGoal, goal } from "@/test/store/goals";
import { buildTask, task } from "@/test/store/tasks";
import { buildTimeEntry, runningTimeEntry } from "@/test/store/time-entries";

const builders = [
  { entity: "goal", build: buildGoal, storedFixture: goal },
  { entity: "task", build: buildTask, storedFixture: task },
  { entity: "time entry", build: buildTimeEntry, storedFixture: runningTimeEntry },
];

it.each(builders)("builds a $entity that no other test can reach", ({ build, storedFixture }) => {
  expect(build()).not.toBe(storedFixture);
  expect(build()).not.toBe(build());
});

it("builds tasks with independent nested collections", () => {
  const firstTask = buildTask();
  const secondTask = buildTask();

  expect(firstTask.tags).not.toBe(secondTask.tags);
  expect(firstTask.time_entries).not.toBe(secondTask.time_entries);
});
