import { useMutation } from "@tanstack/react-query";

import { deleteGoal } from "@/features/goals/api/axios/delete-goal";
import { goalKeys } from "@/features/goals/api/queries";

export const useDeleteGoalMutation = () => {
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: (_response, referenceXid, _, context) => {
      context.client.removeQueries({ queryKey: goalKeys.detail(referenceXid), exact: true });

      return context.client.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};
