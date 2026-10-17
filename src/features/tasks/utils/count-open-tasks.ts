import type { Task } from "../types/task";
import { isOpenTaskStatus, type OpenTaskStatus } from "./task-status";

export type OpenTaskCounts = Record<OpenTaskStatus, number>;

/** How many of the given tasks sit in each Open task status. */
export const countOpenTasks = (tasks: readonly Task[]): OpenTaskCounts => {
  const counts: OpenTaskCounts = { scheduled: 0, in_progress: 0, on_hold: 0 };

  for (const { status } of tasks) {
    if (isOpenTaskStatus(status)) counts[status] += 1;
  }

  return counts;
};
