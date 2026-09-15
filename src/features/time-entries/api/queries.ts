import { queryOptions } from "@tanstack/react-query";

import { getTimeEntries } from "./axios/get-time-entries";
import { TIME_ENTRIES_ENDPOINT } from "@/libs/axios";

export const timeEntryKeys = {
  all: [{ feature: TIME_ENTRIES_ENDPOINT }] as const,
  task: (taskReferenceXid: string) => [{ ...timeEntryKeys.all[0], taskReferenceXid }] as const,
  list: (taskReferenceXid: string) =>
    [{ ...timeEntryKeys.task(taskReferenceXid)[0], entity: "list" }] as const,
};

// Fetches every time entry logged against a single task.
export const taskTimeEntryQueries = {
  list: (taskReferenceXid: string) =>
    queryOptions({ queryKey: timeEntryKeys.list(taskReferenceXid), queryFn: getTimeEntries }),
};
