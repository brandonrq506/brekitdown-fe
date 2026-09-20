import type { QueryFunctionContext } from "@tanstack/react-query";

import type { taskNoteKeys } from "../queries";
import type { TaskNotesResponse } from "../../types/task-note";
import { api, TASKS_ENDPOINT } from "@/libs/axios";

type TaskNoteListQueryKey = ReturnType<typeof taskNoteKeys.list>;

export const getTaskNotes = async ({
  queryKey: [{ taskReferenceXid }],
  signal,
}: QueryFunctionContext<TaskNoteListQueryKey>): Promise<TaskNotesResponse> => {
  const URL = `${TASKS_ENDPOINT}/${taskReferenceXid}/notes`;

  const response = await api.get<TaskNotesResponse>(URL, { signal });

  return response.data;
};
