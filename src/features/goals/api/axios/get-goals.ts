import { api, GOALS_ENDPOINT } from "@/libs/axios";
import type { QueryFunctionContext } from "@tanstack/react-query";
import type { goalKeys } from "@/features/goals/api/queries";
import type { GoalsResponse } from "@/features/goals/types/goal";
import type { PaginationParams } from "@/types/pagination";

type GoalListQueryKey = ReturnType<typeof goalKeys.list>;
type GoalListQueryContext = QueryFunctionContext<GoalListQueryKey, PaginationParams["page"]>;

export const getGoals = async ({
  queryKey: [{ pageSize }],
  pageParam,
  signal,
}: GoalListQueryContext): Promise<GoalsResponse> => {
  const { data } = await api.get<GoalsResponse>(GOALS_ENDPOINT, {
    params: { page: pageParam, page_size: pageSize },
    signal,
  });

  return data;
};
