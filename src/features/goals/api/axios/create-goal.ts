import { api, GOALS_ENDPOINT } from "@/libs/axios";
import type { CreateGoalPayload, GoalResponse } from "@/features/goals/types/goal";

export const createGoal = async (payload: CreateGoalPayload): Promise<GoalResponse> => {
  const response = await api.post<GoalResponse>(GOALS_ENDPOINT, payload);
  return response.data;
};
