import { api, GOALS_ENDPOINT } from "@/libs/axios";
import type { QueryFunctionContext } from "@tanstack/react-query";
import type { goalKeys } from "@/features/goals/api/queries";
import type { GoalsResponse } from "@/features/goals/types/goal";
import type { PaginationParams } from "@/types/pagination";
import { serializeFilters } from "@/utils/api-filters";

type GoalListQueryKey = ReturnType<typeof goalKeys.list>;
type GoalListQueryContext = QueryFunctionContext<GoalListQueryKey, PaginationParams["page"]>;

export const getGoals = async ({
  queryKey: [{ pageSize, filter }],
  pageParam,
  signal,
}: GoalListQueryContext): Promise<GoalsResponse> => {
  const params = serializeFilters(filter);
  params.append("page", String(pageParam));
  params.append("page_size", String(pageSize));

  const response = await api.get<GoalsResponse>(GOALS_ENDPOINT, { params, signal });

  return response.data;
};
