import { TASK_STATUS, type Task } from "@/features/tasks/types/task";
import { isOpenTaskStatus } from "@/features/tasks/utils/task-status";
import type { Goal } from "../types/goal";

/**
 * A goal is ready to complete when every Task is closed and at least one is `completed`.
 * Lives only in the frontend; move it to the API if another consumer needs it.
 */
export const isGoalReadyToComplete = (goal: Goal, tasks: readonly Task[]): boolean =>
  goal.completed_at === null &&
  tasks.every(({ status }) => !isOpenTaskStatus(status)) &&
  tasks.some(({ status }) => status === TASK_STATUS.COMPLETED);
