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
  goal: { reference_xid: goal.reference_xid, name: goal.name },
  notes_count: 5,
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

export const newlyCreatedTask = buildTask({
  reference_xid: "task_created",
  inserted_at: "2026-08-31T12:00:00Z",
  updated_at: "2026-08-31T12:00:00Z",
  name: "Draft the outline",
  description: "",
  status: TASK_STATUS.SCHEDULED,
  due_at: null,
  notes_count: 0,
});

export const closedTasks: Task[] = [
  buildTask({ reference_xid: "task_completed", status: TASK_STATUS.COMPLETED }),
  buildTask({ reference_xid: "task_dropped", status: TASK_STATUS.DROPPED }),
];

/** Two scheduled and one on hold, alongside closed ones. */
export const openTasks: Task[] = [
  buildTask({ reference_xid: "task_scheduled_1", status: TASK_STATUS.SCHEDULED }),
  buildTask({ reference_xid: "task_scheduled_2", status: TASK_STATUS.SCHEDULED }),
  buildTask({ reference_xid: "task_on_hold", status: TASK_STATUS.ON_HOLD }),
  ...closedTasks,
];
