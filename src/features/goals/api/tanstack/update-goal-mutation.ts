import { mutationOptions, type QueryClient } from "@tanstack/react-query";

import { goalKeys } from "@/features/goals/api/queries";
import { updateGoal } from "@/features/goals/api/axios/update-goal";

export const updateGoalMutation = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: updateGoal,
    onSuccess: (response, { referenceXid }) => {
      queryClient.setQueryData(goalKeys.detail(referenceXid), response);

      return queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
