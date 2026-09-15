import { orderGoalDetailsTasks } from "../order-goal-details-tasks";
import { TASK_STATUS, type Task } from "../../types/task";

const task = (overrides: Partial<Task>): Task => ({
  reference_xid: "task-default",
  inserted_at: "2026-09-01T12:00:00Z",
  updated_at: "2026-09-01T12:00:00Z",
  name: "Task",
  description: "",
  status: TASK_STATUS.SCHEDULED,
  due_at: null,
  goal_reference_xid: "goal-01",
  parent_reference_xid: null,
  tags: [],
  time_entries: [],
  has_children: false,
  ...overrides,
});

const taskIds = (tasks: readonly Task[]) => tasks.map(({ reference_xid }) => reference_xid);

it("groups visible tasks by their value on the goal page", () => {
  const tasks = [
    task({ reference_xid: "completed", status: TASK_STATUS.COMPLETED }),
    task({ reference_xid: "scheduled", status: TASK_STATUS.SCHEDULED }),
    task({ reference_xid: "on-hold", status: TASK_STATUS.ON_HOLD }),
    task({ reference_xid: "in-progress", status: TASK_STATUS.IN_PROGRESS }),
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
    task({ reference_xid: "no-due-date", status: TASK_STATUS.IN_PROGRESS }),
    task({
      reference_xid: "due-later",
      status: TASK_STATUS.IN_PROGRESS,
      due_at: "2026-09-20T12:00:00Z",
    }),
    task({
      reference_xid: "due-sooner",
      status: TASK_STATUS.IN_PROGRESS,
      due_at: "2026-09-10T12:00:00Z",
    }),
  ];

  expect(taskIds(orderGoalDetailsTasks(tasks))).toEqual(["due-sooner", "due-later", "no-due-date"]);
});

it("uses the most recently updated task as the fallback within a status", () => {
  const tasks = [
    task({ reference_xid: "older", status: TASK_STATUS.ON_HOLD }),
    task({
      reference_xid: "newer",
      status: TASK_STATUS.ON_HOLD,
      updated_at: "2026-09-02T12:00:00Z",
    }),
  ];

  expect(taskIds(orderGoalDetailsTasks(tasks))).toEqual(["newer", "older"]);
});

it("hides dropped tasks without mutating the API result", () => {
  const dropped = task({ reference_xid: "dropped", status: TASK_STATUS.DROPPED });
  const completed = task({ reference_xid: "completed", status: TASK_STATUS.COMPLETED });
  const tasks = [dropped, completed];

  expect(taskIds(orderGoalDetailsTasks(tasks))).toEqual(["completed"]);
  expect(tasks).toEqual([dropped, completed]);
});
