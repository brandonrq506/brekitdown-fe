import { api, GOALS_ENDPOINT } from "@/libs/axios";
import type { QueryFunctionContext } from "@tanstack/react-query";
import type { GoalResponse } from "@/features/goals/types/goal";

export const getGoal = async (
  referenceXid: string,
  { signal }: QueryFunctionContext,
): Promise<GoalResponse> => {
  const { data } = await api.get<GoalResponse>(`${GOALS_ENDPOINT}/${referenceXid}`, { signal });

  return data;
};
