import { api, GOALS_ENDPOINT } from "@/libs/axios";
import type { GoalResponse } from "@/features/goals/types/goal";

export const completeGoal = async (referenceXid: string): Promise<GoalResponse> => {
  const URL = `${GOALS_ENDPOINT}/${referenceXid}/complete`;

  const response = await api.post<GoalResponse>(URL);

  return response.data;
};
