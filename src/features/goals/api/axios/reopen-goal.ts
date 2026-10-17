import { api, GOALS_ENDPOINT } from "@/libs/axios";
import type { GoalResponse } from "@/features/goals/types/goal";

export const reopenGoal = async (referenceXid: string): Promise<GoalResponse> => {
  const URL = `${GOALS_ENDPOINT}/${referenceXid}/reopen`;

  const response = await api.post<GoalResponse>(URL);

  return response.data;
};
