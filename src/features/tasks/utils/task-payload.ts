import type { CreateTaskPayload, TaskFormValues } from "../types/task";

export const toCreateTaskPayload = (
  { name, description }: TaskFormValues,
  goalReferenceXid: string,
): CreateTaskPayload => ({
  task: {
    name: name.trim(),
    description: description.trim(),
    goal_reference_xid: goalReferenceXid,
  },
});
