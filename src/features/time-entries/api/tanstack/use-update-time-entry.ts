import { useMutation } from "@tanstack/react-query";

import { taskKeys } from "@/features/tasks/api/queries";
import { updateTimeEntry } from "../axios/update-time-entry";

export const useUpdateTimeEntryMutation = () => {
  return useMutation({
    mutationFn: updateTimeEntry,
    // An entry is a task sub-resource and the task payload embeds `time_entries`.
    onSuccess: (_, __, ___, context) =>
      context.client.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
};
