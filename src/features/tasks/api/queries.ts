import type { TaskApiFilters } from "@/features/tasks/types/task-api-filters";
import type { ApiQueryOptions } from "@/types/api-query";

import { TASKS_ENDPOINT } from "@/libs/axios";

import { queryOptions } from "@tanstack/react-query";
import { normalizeFilters } from "@/utils/api-filters";
import { getTasks } from "@/features/tasks/api/axios/get-tasks";
import { getTask } from "./axios/get-task";

export const taskKeys = {
  all: [{ feature: TASKS_ENDPOINT }] as const,
  lists: () => [{ ...taskKeys.all[0], entity: "list" }] as const,
  list: ({ filter = {} }: ApiQueryOptions<TaskApiFilters> = {}) =>
    [{ ...taskKeys.lists()[0], filter: normalizeFilters(filter) }] as const,
  details: () => [{ ...taskKeys.all[0], entity: "details" }] as const,
  detail: (referenceXid: string) => [{ ...taskKeys.details()[0], referenceXid }] as const,
};

export const taskQueries = {
  detail: (referenceXid: string) =>
    queryOptions({ queryKey: taskKeys.detail(referenceXid), queryFn: getTask }),
};

// Task query for the goal's detail page.
export const goalDetailsPageTasksQueryOptions = (goalReferenceXid: string | null) => {
  return queryOptions({
    queryKey: taskKeys.list({
      filter: {
        goal_reference_xid:
          goalReferenceXid === null ? { empty: true } : { "==": goalReferenceXid },
      },
    }),
    queryFn: getTasks,
  });
};
