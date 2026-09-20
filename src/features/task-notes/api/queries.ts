import { queryOptions } from "@tanstack/react-query";

import { getTaskNotes } from "./axios/get-task-notes";

export const taskNoteKeys = {
  all: [{ feature: "/task-notes" }] as const,
  task: (taskReferenceXid: string) => [{ ...taskNoteKeys.all[0], taskReferenceXid }] as const,
  list: (taskReferenceXid: string) =>
    [{ ...taskNoteKeys.task(taskReferenceXid)[0], entity: "list" }] as const,
};

export const taskNoteQueries = {
  list: (taskReferenceXid: string) =>
    queryOptions({ queryKey: taskNoteKeys.list(taskReferenceXid), queryFn: getTaskNotes }),
};
