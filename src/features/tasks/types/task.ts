import type { ApiResource, ObjectValues } from "@/types/core/helpers";

export const TASK_STATUS = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  DROPPED: "dropped",
  ON_HOLD: "on_hold",
} as const;

export type TASK_STATUS = ObjectValues<typeof TASK_STATUS>;

export interface TaskTag extends ApiResource {
  name: string;
}

export interface Task extends ApiResource {
  name: string;
  status: TASK_STATUS;
  due_at: string | null;
  goal_reference_xid: string | null;
  parent_reference_xid: string | null;
  tags: TaskTag[];
}

export interface TasksResponse {
  data: Task[];
}
