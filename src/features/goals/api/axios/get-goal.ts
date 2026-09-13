import { api, GOALS_ENDPOINT } from "@/libs/axios";

import type { QueryFunctionContext } from "@tanstack/react-query";
import type { goalKeys } from "@/features/goals/api/queries";
import type { GoalResponse } from "@/features/goals/types/goal";

type GoalDetailQueryKey = ReturnType<typeof goalKeys.detail>;

export const getGoal = async ({
  signal,
  queryKey: [{ referenceXid }],
}: QueryFunctionContext<GoalDetailQueryKey>): Promise<GoalResponse> => {
  const URL = `${GOALS_ENDPOINT}/${referenceXid}`;
  const response = await api.get<GoalResponse>(URL, { signal });

  return response.data;
};
