import { useMutation } from "@tanstack/react-query";

import { completeGoal } from "@/features/goals/api/axios/complete-goal";
import { goalKeys } from "@/features/goals/api/queries";

export const useCompleteGoalMutation = () => {
  return useMutation({
    mutationFn: completeGoal,
    onSuccess: (response, referenceXid, _, context) => {
      context.client.setQueryData(goalKeys.detail(referenceXid), response);

      return context.client.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};
