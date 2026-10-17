import { isGoalReadyToComplete } from "../is-goal-ready-to-complete";
import { TASK_STATUS } from "@/features/tasks/types/task";
import { completedGoal, goal } from "@/test/store/goals";
import { buildTask } from "@/test/store/tasks";

const completed = buildTask({ reference_xid: "task_completed", status: TASK_STATUS.COMPLETED });
const dropped = buildTask({ reference_xid: "task_dropped", status: TASK_STATUS.DROPPED });
const subtask = buildTask({
  reference_xid: "task_sub",
  parent_reference_xid: completed.reference_xid,
  status: TASK_STATUS.COMPLETED,
});

it("is ready when every task is closed and at least one is completed", () => {
  expect(isGoalReadyToComplete(goal, [completed, dropped, subtask])).toBe(true);
});

it.each([TASK_STATUS.SCHEDULED, TASK_STATUS.IN_PROGRESS, TASK_STATUS.ON_HOLD])(
  "is not ready while a task is %s",
  (status) => {
    expect(isGoalReadyToComplete(goal, [completed, buildTask({ status })])).toBe(false);
  },
);

it("is not ready while an open subtask remains", () => {
  const openSubtask = buildTask({ ...subtask, status: TASK_STATUS.SCHEDULED });

  expect(isGoalReadyToComplete(goal, [completed, openSubtask])).toBe(false);
});

it("is not ready when every task is dropped", () => {
  expect(isGoalReadyToComplete(goal, [dropped])).toBe(false);
});

it("is not ready for a goal with no tasks", () => {
  expect(isGoalReadyToComplete(goal, [])).toBe(false);
});

it("is not ready once the goal is completed", () => {
  expect(isGoalReadyToComplete(completedGoal, [completed])).toBe(false);
});
