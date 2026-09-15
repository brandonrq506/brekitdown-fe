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

it("orders actionable tasks by the earliest due date", () => {
  const tasks = [
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

  expect(taskIds(orderGoalDetailsTasks(tasks))).toEqual(["due-sooner", "due-later"]);
});

it("puts an actionable task without a due date after the dated ones", () => {
  const tasks = [
    buildTask({ reference_xid: "no-due-date", status: TASK_STATUS.IN_PROGRESS, due_at: null }),
    buildTask({
      reference_xid: "due-later",
      status: TASK_STATUS.IN_PROGRESS,
      due_at: "2026-09-20T12:00:00Z",
    }),
  ];

  expect(taskIds(orderGoalDetailsTasks(tasks))).toEqual(["due-later", "no-due-date"]);
});

it("uses the most recently updated task as the fallback within a status", () => {
  const tasks = [
    buildTask({
      reference_xid: "older",
      status: TASK_STATUS.ON_HOLD,
      updated_at: "2026-08-21T12:00:00Z",
    }),
    buildTask({
      reference_xid: "newer",
      status: TASK_STATUS.ON_HOLD,
      updated_at: "2026-09-02T12:00:00Z",
    }),
  ];

  expect(taskIds(orderGoalDetailsTasks(tasks))).toEqual(["newer", "older"]);
});

it("hides dropped tasks from the goal page", () => {
  const tasks = [
    buildTask({ reference_xid: "dropped", status: TASK_STATUS.DROPPED }),
    buildTask({ reference_xid: "completed", status: TASK_STATUS.COMPLETED }),
  ];

  expect(taskIds(orderGoalDetailsTasks(tasks))).toEqual(["completed"]);
});

it("leaves the API result in the order it arrived", () => {
  const tasks = [
    buildTask({ reference_xid: "completed", status: TASK_STATUS.COMPLETED }),
    buildTask({ reference_xid: "in-progress", status: TASK_STATUS.IN_PROGRESS }),
  ];

  orderGoalDetailsTasks(tasks);

  expect(taskIds(tasks)).toEqual(["completed", "in-progress"]);
});
