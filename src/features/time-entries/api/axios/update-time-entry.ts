import { timeEntriesEndpoint } from "../endpoint";
import type { UpdateTimeEntryPayload, TimeEntryResponse } from "../../types/time-entry";
import { api } from "@/libs/axios";

interface UpdateTimeEntryVariables {
  taskReferenceXid: string;
  entryReferenceXid: string;
  payload: UpdateTimeEntryPayload;
}

export const updateTimeEntry = async ({
  taskReferenceXid,
  entryReferenceXid,
  payload,
}: UpdateTimeEntryVariables): Promise<TimeEntryResponse> => {
  const URL = `${timeEntriesEndpoint(taskReferenceXid)}/${entryReferenceXid}`;

  const response = await api.patch<TimeEntryResponse>(URL, payload);

  return response.data;
};
