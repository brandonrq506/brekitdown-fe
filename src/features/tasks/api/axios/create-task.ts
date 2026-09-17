import { api, TASKS_ENDPOINT } from "@/libs/axios";
import type { CreateTaskPayload, TaskResponse } from "../../types/task";

export const createTask = async (payload: CreateTaskPayload): Promise<TaskResponse> => {
  const response = await api.post<TaskResponse>(TASKS_ENDPOINT, payload);
  return response.data;
};
