import { useMutation } from "@tanstack/react-query";

import { createGoal } from "@/features/goals/api/axios/create-goal";
import { goalKeys } from "@/features/goals/api/queries";

export const useCreateGoalMutation = () => {
  return useMutation({
    mutationFn: createGoal,
    onSuccess: (response, _, __, context) => {
      context.client.setQueryData(goalKeys.detail(response.data.reference_xid), response);

      return context.client.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};
