import { timeEntriesEndpoint } from "../endpoint";
import type { CreateTimeEntryPayload, TimeEntryResponse } from "../../types/time-entry";
import { api } from "@/libs/axios";

interface CreateTimeEntryVariables {
  taskReferenceXid: string;
  payload: CreateTimeEntryPayload;
}

export const createTimeEntry = async ({
  taskReferenceXid,
  payload,
}: CreateTimeEntryVariables): Promise<TimeEntryResponse> => {
  const URL = timeEntriesEndpoint(taskReferenceXid);

  const response = await api.post<TimeEntryResponse>(URL, payload);

  return response.data;
};
