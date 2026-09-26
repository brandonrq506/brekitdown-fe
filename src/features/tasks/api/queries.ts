import type { TaskApiFilters } from "@/features/tasks/types/task-api-filters";
import type { ApiQueryOptions } from "@/types/api-query";
import type { PageSize } from "@/types/pagination";

import { TASKS_ENDPOINT } from "@/libs/axios";

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE, FIRST_CURSOR } from "@/constants/pagination";
import { normalizeFilters } from "@/utils/api-filters";
import { getTasks } from "@/features/tasks/api/axios/get-tasks";
import { getTask } from "./axios/get-task";
import { getRecommendedTasks } from "./axios/get-recommended-tasks";

export const taskKeys = {
  all: [{ feature: TASKS_ENDPOINT }] as const,
  lists: () => [{ ...taskKeys.all[0], entity: "list" }] as const,
  list: ({ filter = {} }: ApiQueryOptions<TaskApiFilters> = {}) =>
    [{ ...taskKeys.lists()[0], filter: normalizeFilters(filter) }] as const,
  details: () => [{ ...taskKeys.all[0], entity: "details" }] as const,
  detail: (referenceXid: string) => [{ ...taskKeys.details()[0], referenceXid }] as const,
  recommendations: (first: PageSize) =>
    [{ ...taskKeys.lists()[0], view: "recommendations", first }] as const,
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

export const recommendationsPageQueryOptions = (first: PageSize = DEFAULT_PAGE_SIZE) => {
  return infiniteQueryOptions({
    queryKey: taskKeys.recommendations(first),
    queryFn: getRecommendedTasks,
    initialPageParam: FIRST_CURSOR,
    // v5 treats `null` and `undefined` alike: no next page.
    getNextPageParam: (lastPage) => (lastPage.meta.has_next_page ? lastPage.meta.end_cursor : null),
  });
};
