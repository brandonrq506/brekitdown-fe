import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@/constants/pagination";
import { getGoal } from "@/features/goals/api/axios/getGoal";
import { getGoals } from "@/features/goals/api/axios/getGoals";
import { GOALS_ENDPOINT } from "@/libs/axios";
import type { PageSize } from "@/types/pagination";

export const goalKeys = {
  all: [{ feature: GOALS_ENDPOINT }] as const,
  lists: () => [{ ...goalKeys.all[0], entity: "list" }] as const,
  list: (pageSize: PageSize) => [{ ...goalKeys.lists()[0], pageSize }] as const,
  details: () => [{ ...goalKeys.all[0], entity: "details" }] as const,
  detail: (referenceXid: string) => [{ ...goalKeys.details()[0], referenceXid }] as const,
};

export const goalQueries = {
  list: (pageSize: PageSize = DEFAULT_PAGE_SIZE) =>
    infiniteQueryOptions({
      queryKey: goalKeys.list(pageSize),
      queryFn: getGoals,
      initialPageParam: FIRST_PAGE,
      getNextPageParam: (lastPage) => lastPage.meta.next_page ?? undefined,
    }),
  detail: (referenceXid: string) =>
    queryOptions({
      queryKey: goalKeys.detail(referenceXid),
      queryFn: getGoal,
    }),
};
