import { TASK_STATUS, type Task } from "@/features/tasks/types/task";
import { goal } from "@/test/store/goals";

const taskDefaults = {
  reference_xid: "task_01",
  inserted_at: "2026-08-20T12:00:00Z",
  updated_at: "2026-08-21T12:00:00Z",
  name: "Draft Sendero case study",
  description: "Explain the problem, approach, and outcome.",
  status: TASK_STATUS.IN_PROGRESS,
  due_at: "2026-09-28T12:00:00Z",
  goal_reference_xid: goal.reference_xid,
  parent_reference_xid: null,
  time_entries: [],
  has_children: false,
  tags: [],
} satisfies Task;

export const buildTask = (overrides?: Partial<Task>): Task => {
  const result = { ...taskDefaults, ...overrides };

  return {
    ...result,
    tags: [...result.tags],
    time_entries: [...result.time_entries],
  };
};

export const task = buildTask();

export const tasks: Task[] = [task];
