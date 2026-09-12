import { queryOptions } from "@tanstack/react-query";

import { getTimeEntries } from "./axios/getTimeEntries";
import { TIME_ENTRIES_ENDPOINT } from "@/libs/axios";

export const timeEntryKeys = {
  all: [{ feature: TIME_ENTRIES_ENDPOINT }] as const,
  task: (taskReferenceXid: string) => [{ ...timeEntryKeys.all[0], taskReferenceXid }] as const,
  list: (taskReferenceXid: string) =>
    [{ ...timeEntryKeys.task(taskReferenceXid)[0], entity: "list" }] as const,
};

export const timeEntryQueries = {
  list: (taskReferenceXid: string) =>
    queryOptions({ queryKey: timeEntryKeys.list(taskReferenceXid), queryFn: getTimeEntries }),
};
