import type { QueryFunctionContext } from "@tanstack/react-query";

import type { taskKeys } from "@/features/tasks/api/queries";
import type { RecommendedTasksResponse } from "@/features/tasks/types/task";
import type { CursorPageParam } from "@/types/pagination";
import { api, RECOMMENDATIONS_ENDPOINT } from "@/libs/axios";

type RecommendationsQueryKey = ReturnType<typeof taskKeys.recommendations>;
type RecommendationsQueryContext = QueryFunctionContext<RecommendationsQueryKey, CursorPageParam>;

export const getRecommendedTasks = async ({
  queryKey: [{ first }],
  pageParam,
  signal,
}: RecommendationsQueryContext): Promise<RecommendedTasksResponse> => {
  const response = await api.get<RecommendedTasksResponse>(RECOMMENDATIONS_ENDPOINT, {
    // Axios serializes `null` as an empty string, but drops `undefined` params.
    params: { first, after: pageParam ?? undefined },
    signal,
  });

  return response.data;
};
