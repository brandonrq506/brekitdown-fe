import { useMutation } from "@tanstack/react-query";

import { taskKeys } from "@/features/tasks/api/queries";
import { createTimeEntry } from "../axios/create-time-entry";

export const useCreateTimeEntryMutation = () => {
  return useMutation({
    mutationFn: createTimeEntry,
    // An entry is a task sub-resource and the task payload embeds `time_entries`.
    onSuccess: (_, __, ___, context) =>
      context.client.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
};
