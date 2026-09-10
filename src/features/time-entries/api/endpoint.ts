import { TASKS_ENDPOINT, TIME_ENTRIES_ENDPOINT } from "@/libs/axios";

export const timeEntriesEndpoint = (taskReferenceXid: string) =>
  `${TASKS_ENDPOINT}/${taskReferenceXid}${TIME_ENTRIES_ENDPOINT}`;
