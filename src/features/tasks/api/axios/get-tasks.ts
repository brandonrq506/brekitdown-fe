import type { QueryFunctionContext } from "@tanstack/react-query";

import type { taskKeys } from "@/features/tasks/api/queries";
import type { TasksResponse } from "@/features/tasks/types/task";
import { serializeFilters } from "@/utils/api-filters";
import { api, TASKS_ENDPOINT } from "@/libs/axios";

type TaskListQueryKey = ReturnType<typeof taskKeys.list>;

export const getTasks = async ({
  queryKey: [{ filter }],
  signal,
}: QueryFunctionContext<TaskListQueryKey>): Promise<TasksResponse> => {
  const { data } = await api.get<TasksResponse>(TASKS_ENDPOINT, {
    params: serializeFilters(filter),
    signal,
  });

  return data;
};
