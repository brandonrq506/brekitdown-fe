import { useMutation } from "@tanstack/react-query";

import { completeGoal } from "@/features/goals/api/axios/complete-goal";
import { goalKeys } from "@/features/goals/api/queries";
import { taskKeys } from "@/features/tasks/api/queries";

export const useCompleteGoalMutation = () => {
  return useMutation({
    mutationFn: completeGoal,
    onSuccess: (response, referenceXid, _, context) => {
      context.client.setQueryData(goalKeys.detail(referenceXid), response);

      // Completing drops the goal's Open tasks, so every cached task may be stale.
      return Promise.all([
        context.client.invalidateQueries({ queryKey: goalKeys.lists() }),
        context.client.invalidateQueries({ queryKey: taskKeys.all }),
      ]);
    },
  });
};
