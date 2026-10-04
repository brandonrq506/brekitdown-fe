import type { ReactNode } from "react";

import { TASK_STATUS, type TASK_STATUS as TaskStatus } from "../../types/task";
import { DueDate } from "./due-date";
import { Created, TimeSpent } from "./parts";
import { useTaskCard } from "./context";

/**
 * Which facts a status makes relevant, from thoughts-on-task-card.md. A status is exhaustively
 * keyed so adding one fails to compile until its row is written. The elements are shared between
 * cards on purpose: every part reads its task from context, so they carry no per-card state.
 */
const STATUS_DETAILS = {
  [TASK_STATUS.SCHEDULED]: (
    <>
      <Created />
      <DueDate />
    </>
  ),
  [TASK_STATUS.IN_PROGRESS]: (
    <>
      <Created />
      <DueDate />
      <TimeSpent />
    </>
  ),
  [TASK_STATUS.ON_HOLD]: (
    <>
      <Created />
      <DueDate />
    </>
  ),
  [TASK_STATUS.COMPLETED]: <TimeSpent />,
  [TASK_STATUS.DROPPED]: <Created />,
} satisfies Record<TaskStatus, ReactNode>;

/** The status-relevant facts. Expects the Footer's `dl` as its parent. */
export const StatusDetails = () => {
  const { task } = useTaskCard();

  return STATUS_DETAILS[task.status];
};
