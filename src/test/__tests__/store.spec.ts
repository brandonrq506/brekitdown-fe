import { buildGoal, goal } from "@/test/store/goals";
import { buildTask } from "@/test/store/tasks";
import { buildTimeEntry, runningTimeEntry } from "@/test/store/time-entries";

it("builds independent goal and time-entry objects", () => {
  expect(buildGoal()).not.toBe(goal);
  expect(buildTimeEntry()).not.toBe(runningTimeEntry);
});

it("builds tasks with independent nested collections", () => {
  const firstTask = buildTask();
  const secondTask = buildTask();

  expect(firstTask).not.toBe(secondTask);
  expect(firstTask.tags).not.toBe(secondTask.tags);
  expect(firstTask.time_entries).not.toBe(secondTask.time_entries);
});
