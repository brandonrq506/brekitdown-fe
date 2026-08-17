import { mutationOptions, type QueryClient } from "@tanstack/react-query";

import { deleteGoal } from "@/features/goals/api/axios/deleteGoal";
import { goalKeys } from "@/features/goals/api/queries";

export const deleteGoalMutation = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: deleteGoal,
    onSuccess: (_response, referenceXid) => {
      queryClient.removeQueries({ queryKey: goalKeys.detail(referenceXid), exact: true });

      return queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
