import { queryOptions } from "@tanstack/react-query";

import { getTasks } from "@/features/tasks/api/axios/getTasks";
import type { TaskApiFilters } from "@/features/tasks/types/task-api-filters";
import { TASKS_ENDPOINT } from "@/libs/axios";
import type { ApiQueryOptions } from "@/types/api-query";
import { normalizeFilters } from "@/utils/api-filters";

export const taskKeys = {
  all: [{ feature: TASKS_ENDPOINT }] as const,
  lists: () => [{ ...taskKeys.all[0], entity: "list" }] as const,
  list: ({ filter = {} }: ApiQueryOptions<TaskApiFilters> = {}) =>
    [{ ...taskKeys.lists()[0], filter: normalizeFilters(filter) }] as const,
};

// Task query for the goal's detail page.
export const goalDetailsPageTasksQueryOptions = (goalReferenceXid: string) => {
  return queryOptions({
    queryKey: taskKeys.list({
      filter: {
        goal_reference_xid: { "==": goalReferenceXid },
      },
    }),
    queryFn: getTasks,
  });
};
