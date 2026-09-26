import { createContext, useContext } from "react";

import type { Task } from "../../types/task";

export interface TaskCardContextValue {
  task: Task;
  titleId: string;
}

export const TaskCardContext = createContext<TaskCardContextValue | null>(null);

export const useTaskCard = (): TaskCardContextValue => {
  const value = useContext(TaskCardContext);
  if (value === null) throw new Error("TaskCard parts must render inside <TaskCard.Root>.");

  return value;
};
