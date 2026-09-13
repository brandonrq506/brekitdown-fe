import { api, TASKS_ENDPOINT } from "@/libs/axios";

export const deleteTask = async (referenceXid: string): Promise<void> => {
  const URL = `${TASKS_ENDPOINT}/${referenceXid}`;
  await api.delete<void>(URL);
};
