import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTimeEntry } from "../axios/updateTimeEntry";
import { timeEntryKeys } from "../queries";

export const useUpdateTimeEntryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTimeEntry,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: timeEntryKeys.task(variables.taskReferenceXid),
      });
    },
  });
};
