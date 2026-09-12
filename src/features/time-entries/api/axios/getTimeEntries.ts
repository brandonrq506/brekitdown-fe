import type { QueryFunctionContext } from "@tanstack/react-query";

import type { timeEntryKeys } from "../queries";
import { timeEntriesEndpoint } from "../endpoint";
import type { TimeEntriesResponse } from "../../types/time-entry";
import { api } from "@/libs/axios";

type TimeEntryListQueryKey = ReturnType<typeof timeEntryKeys.list>;

/**
 * Fetches every time entry logged against a single task.
 */
export const getTimeEntries = async ({
  queryKey: [{ taskReferenceXid }],
  signal,
}: QueryFunctionContext<TimeEntryListQueryKey>): Promise<TimeEntriesResponse> => {
  const URL = timeEntriesEndpoint(taskReferenceXid);

  const response = await api.get<TimeEntriesResponse>(URL, {
    signal,
  });

  return response.data;
};
