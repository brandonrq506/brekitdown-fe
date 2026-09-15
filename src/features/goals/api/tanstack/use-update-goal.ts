import { useMutation } from "@tanstack/react-query";

import { updateGoal } from "@/features/goals/api/axios/update-goal";
import { goalKeys } from "@/features/goals/api/queries";

export const useUpdateGoalMutation = () => {
  return useMutation({
    mutationFn: updateGoal,
    onSuccess: (response, { referenceXid }, _, context) => {
      context.client.setQueryData(goalKeys.detail(referenceXid), response);

      return context.client.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};
