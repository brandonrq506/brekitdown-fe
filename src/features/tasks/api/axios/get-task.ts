import type { QueryFunctionContext } from "@tanstack/react-query";
import type { taskKeys } from "@/features/tasks/api/queries";
import type { TaskResponse } from "@/features/tasks/types/task";

import { api, TASKS_ENDPOINT } from "@/libs/axios";

type TaskDetailQueryKey = ReturnType<typeof taskKeys.detail>;

export const getTask = async ({
  queryKey: [{ referenceXid }],
  signal,
}: QueryFunctionContext<TaskDetailQueryKey>): Promise<TaskResponse> => {
  const URL = `${TASKS_ENDPOINT}/${referenceXid}`;

  const response = await api.get<TaskResponse>(URL, { signal });

  return response.data;
};
