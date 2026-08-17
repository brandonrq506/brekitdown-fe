import { mutationOptions, type QueryClient } from "@tanstack/react-query";

import { createGoal } from "@/features/goals/api/axios/createGoal";
import { goalKeys } from "@/features/goals/api/queries";

export const createGoalMutation = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: createGoal,
    onSuccess: (response) => {
      queryClient.setQueryData(goalKeys.detail(response.data.reference_xid), response);

      return queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
