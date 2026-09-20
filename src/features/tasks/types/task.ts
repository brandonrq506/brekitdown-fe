import type { TimeEntry } from "@/features/time-entries/types/time-entry";
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
  description: string;
  status: TASK_STATUS;
  due_at: string | null;
  goal_reference_xid: string | null;
  notes_count: number;
  parent_reference_xid: string | null;
  tags: TaskTag[];
  time_entries: TimeEntry[];
  has_children: boolean;
}

export interface TasksResponse {
  data: Task[];
}

export interface TaskResponse {
  data: Task;
}

export interface TaskFormValues extends Pick<Task, "name" | "description"> {
  dueAt: Date | null;
}

/** This creation flow always creates a root task in the current goal. */
export interface CreateTaskPayload {
  task: Pick<Task, "name" | "description" | "due_at"> & { goal_reference_xid: string };
}
