import { useMutation } from "@tanstack/react-query";

import { reopenGoal } from "@/features/goals/api/axios/reopen-goal";
import { goalKeys } from "@/features/goals/api/queries";

export const useReopenGoalMutation = () => {
  return useMutation({
    mutationFn: reopenGoal,
    onSuccess: (response, referenceXid, _, context) => {
      context.client.setQueryData(goalKeys.detail(referenceXid), response);

      // Reopening leaves tasks as they are, so only the goal lists can be stale.
      return context.client.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};
