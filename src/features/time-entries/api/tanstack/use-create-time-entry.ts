import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTimeEntry } from "../axios/createTimeEntry";
import { timeEntryKeys } from "../queries";

export const useCreateTimeEntryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTimeEntry,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: timeEntryKeys.task(variables.taskReferenceXid),

        // TODO: This also needs to invalidate the task because of the status.
      });
    },
  });
};
