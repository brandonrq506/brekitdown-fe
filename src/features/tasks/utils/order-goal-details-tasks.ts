import { TASK_STATUS, type Task, type TASK_STATUS as TaskStatus } from "../types/task";

const STATUS_ORDER: Record<TaskStatus, number> = {
  [TASK_STATUS.IN_PROGRESS]: 0,
  [TASK_STATUS.ON_HOLD]: 1,
  [TASK_STATUS.SCHEDULED]: 2,
  [TASK_STATUS.COMPLETED]: 3,
  [TASK_STATUS.DROPPED]: 4,
};

const compareInstants = (left: string, right: string): number =>
  Date.parse(left) - Date.parse(right);

const compareOptionalInstants = (left: string | null, right: string | null): number => {
  if (left === null) return right === null ? 0 : 1;
  if (right === null) return -1;
  return compareInstants(left, right);
};

const compareTasks = (left: Task, right: Task): number => {
  const statusDifference = STATUS_ORDER[left.status] - STATUS_ORDER[right.status];
  if (statusDifference !== 0) return statusDifference;

  if (left.status === TASK_STATUS.IN_PROGRESS || left.status === TASK_STATUS.SCHEDULED) {
    const dueDateDifference = compareOptionalInstants(left.due_at, right.due_at);
    if (dueDateDifference !== 0) return dueDateDifference;
  }

  const updatedAtDifference = compareInstants(right.updated_at, left.updated_at);
  if (updatedAtDifference !== 0) return updatedAtDifference;
  return left.reference_xid.localeCompare(right.reference_xid);
};

export const orderGoalDetailsTasks = (tasks: readonly Task[]): Task[] =>
  tasks.filter((task) => task.status !== TASK_STATUS.DROPPED).toSorted(compareTasks);
