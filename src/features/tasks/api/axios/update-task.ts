import { api, TASKS_ENDPOINT } from "@/libs/axios";
import type { TaskResponse, UpdateTaskPayload } from "../../types/task";

interface Props {
  referenceXid: string;
  payload: UpdateTaskPayload;
}

export const updateTask = async ({ referenceXid, payload }: Props): Promise<TaskResponse> => {
  const URL = `${TASKS_ENDPOINT}/${referenceXid}`;

  const response = await api.patch<TaskResponse>(URL, payload);

  return response.data;
};
