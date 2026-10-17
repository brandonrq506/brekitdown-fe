import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@/constants/pagination";
import { getGoal } from "@/features/goals/api/axios/get-goal";
import { getGoals } from "@/features/goals/api/axios/get-goals";
import type { GoalApiFilters } from "@/features/goals/types/goal-api-filters";
import { GOALS_ENDPOINT } from "@/libs/axios";
import type { ApiQueryOptions } from "@/types/api-query";
import type { PageSize } from "@/types/pagination";
import { normalizeFilters } from "@/utils/api-filters";

export const goalKeys = {
  all: [{ feature: GOALS_ENDPOINT }] as const,
  lists: () => [{ ...goalKeys.all[0], entity: "list" }] as const,
  list: (pageSize: PageSize, { filter = {} }: ApiQueryOptions<GoalApiFilters> = {}) =>
    [{ ...goalKeys.lists()[0], pageSize, filter: normalizeFilters(filter) }] as const,
  details: () => [{ ...goalKeys.all[0], entity: "details" }] as const,
  detail: (referenceXid: string) => [{ ...goalKeys.details()[0], referenceXid }] as const,
};

interface GoalsIndexPageOptions {
  pageSize?: PageSize;
  /** Completed goals are hidden from the index unless asked for. */
  includeCompleted?: boolean;
}

export const goalsIndexPageQueryOptions = ({
  pageSize = DEFAULT_PAGE_SIZE,
  includeCompleted = false,
}: GoalsIndexPageOptions = {}) => {
  const filter: GoalApiFilters = includeCompleted ? {} : { completed: { "==": false } };

  return infiniteQueryOptions({
    queryKey: goalKeys.list(pageSize, { filter }),
    queryFn: getGoals,
    initialPageParam: FIRST_PAGE,
    getNextPageParam: (lastPage) => lastPage.meta.next_page ?? undefined,
  });
};

export const goalDetailsPageQueryOptions = (referenceXid: string) => {
  return queryOptions({
    queryKey: goalKeys.detail(referenceXid),
    queryFn: getGoal,
  });
};
