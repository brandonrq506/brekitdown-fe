import type {
  CreateTaskPayload,
  TaskFormValues,
  TASK_STATUS,
  UpdateTaskPayload,
} from "../types/task";

export const toCreateTaskPayload = (
  { name, description, dueAt }: TaskFormValues,
  goalReferenceXid: string,
): CreateTaskPayload => ({
  task: {
    name: name.trim(),
    description: description.trim(),
    due_at: dueAt?.toISOString() ?? null,
    goal_reference_xid: goalReferenceXid,
  },
});

export const toUpdateTaskDueAtPayload = (dueAt: Date | null): UpdateTaskPayload => ({
  task: { due_at: dueAt?.toISOString() ?? null },
});

export const toUpdateTaskStatusPayload = (status: TASK_STATUS): UpdateTaskPayload => ({
  task: { status },
});
