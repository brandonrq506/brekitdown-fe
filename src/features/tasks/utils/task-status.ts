import { TASK_STATUS } from "../types/task";

const STATUSES: readonly TASK_STATUS[] = Object.values(TASK_STATUS);

export const isTaskStatus = (value: unknown): value is TASK_STATUS =>
  typeof value === "string" && STATUSES.some((status) => status === value);
