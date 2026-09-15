import { orderGoalDetailsTasks } from "../order-goal-details-tasks";
import { TASK_STATUS, type Task } from "../../types/task";
import { buildTask } from "@/test/store/tasks";

const taskIds = (tasks: readonly Task[]) => tasks.map(({ reference_xid }) => reference_xid);

it("groups visible tasks by their value on the goal page", () => {
  const tasks = [
    buildTask({ reference_xid: "completed", status: TASK_STATUS.COMPLETED }),
    buildTask({ reference_xid: "scheduled", status: TASK_STATUS.SCHEDULED }),
    buildTask({ reference_xid: "on-hold", status: TASK_STATUS.ON_HOLD }),
    buildTask({ reference_xid: "in-progress", status: TASK_STATUS.IN_PROGRESS }),
  ];

  expect(taskIds(orderGoalDetailsTasks(tasks))).toEqual([
    "in-progress",
    "on-hold",
    "scheduled",
    "completed",
  ]);
});

it("orders actionable tasks by the earliest due date and puts missing dates last", () => {
  const tasks = [
    buildTask({ reference_xid: "no-due-date", status: TASK_STATUS.IN_PROGRESS }),
    buildTask({
      reference_xid: "due-later",
      status: TASK_STATUS.IN_PROGRESS,
      due_at: "2026-09-20T12:00:00Z",
    }),
    buildTask({
      reference_xid: "due-sooner",
      status: TASK_STATUS.IN_PROGRESS,
      due_at: "2026-09-10T12:00:00Z",
    }),
  ];

  expect(taskIds(orderGoalDetailsTasks(tasks))).toEqual(["due-sooner", "due-later", "no-due-date"]);
});

it("uses the most recently updated task as the fallback within a status", () => {
  const tasks = [
    buildTask({ reference_xid: "older", status: TASK_STATUS.ON_HOLD }),
    buildTask({
      reference_xid: "newer",
      status: TASK_STATUS.ON_HOLD,
      updated_at: "2026-09-02T12:00:00Z",
    }),
  ];

  expect(taskIds(orderGoalDetailsTasks(tasks))).toEqual(["newer", "older"]);
});

it("hides dropped tasks without mutating the API result", () => {
  const dropped = buildTask({ reference_xid: "dropped", status: TASK_STATUS.DROPPED });
  const completed = buildTask({ reference_xid: "completed", status: TASK_STATUS.COMPLETED });
  const tasks = [dropped, completed];

  expect(taskIds(orderGoalDetailsTasks(tasks))).toEqual(["completed"]);
  expect(tasks).toEqual([dropped, completed]);
});
