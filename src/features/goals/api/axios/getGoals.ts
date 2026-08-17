import { api, GOALS_ENDPOINT } from "@/libs/axios";
import type { QueryFunctionContext } from "@tanstack/react-query";
import type { GoalsResponse } from "@/features/goals/types/goal";

export const getGoals = async ({ signal }: QueryFunctionContext): Promise<GoalsResponse> => {
  const { data } = await api.get<GoalsResponse>(GOALS_ENDPOINT, { signal });
  return data;
};
