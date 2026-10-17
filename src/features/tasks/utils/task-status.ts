import { TASK_STATUS } from "../types/task";

const STATUSES: readonly TASK_STATUS[] = Object.values(TASK_STATUS);

export const isTaskStatus = (value: unknown): value is TASK_STATUS =>
  typeof value === "string" && STATUSES.some((status) => status === value);

/** Statuses of an Open task. Mirrors the API's Open/Closed grouping. */
export const OPEN_TASK_STATUSES = [
  TASK_STATUS.SCHEDULED,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.ON_HOLD,
] as const;

export type OpenTaskStatus = (typeof OPEN_TASK_STATUSES)[number];

export const isOpenTaskStatus = (status: TASK_STATUS): status is OpenTaskStatus =>
  OPEN_TASK_STATUSES.some((openStatus) => openStatus === status);
