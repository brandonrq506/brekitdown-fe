import { api, GOALS_ENDPOINT } from "@/libs/axios";
import type { GoalResponse, UpdateGoalPayload } from "@/features/goals/types/goal";

interface Props {
  referenceXid: string;
  payload: UpdateGoalPayload;
}

export const updateGoal = async ({ referenceXid, payload }: Props): Promise<GoalResponse> => {
  const URL = `${GOALS_ENDPOINT}/${referenceXid}`;

  const { data } = await api.patch<GoalResponse>(URL, payload);
  return data;
};
