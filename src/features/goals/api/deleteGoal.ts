import { api, GOALS_ENDPOINT } from "@/libs/axios";

export const deleteGoal = async (referenceXid: string): Promise<void> => {
  const URL = `${GOALS_ENDPOINT}/${referenceXid}`;
  await api.delete<void>(URL);
};
