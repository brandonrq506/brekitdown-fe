import type { CreateTaskPayload, TaskFormValues } from "../types/task";

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
