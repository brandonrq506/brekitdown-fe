import { useMutation } from "@tanstack/react-query";

import { taskKeys } from "../queries";
import { createTask } from "../axios/create-task";

export const useCreateTaskMutation = () =>
  useMutation({
    mutationFn: createTask,
    onSuccess: (response, _, __, context) => {
      context.client.setQueryData(taskKeys.detail(response.data.reference_xid), response);

      return context.client.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
