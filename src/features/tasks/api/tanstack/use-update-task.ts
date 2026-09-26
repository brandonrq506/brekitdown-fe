import { useMutation } from "@tanstack/react-query";

import { taskKeys } from "../queries";
import { updateTask } from "../axios/update-task";

export const useUpdateTaskMutation = () =>
  useMutation({
    mutationFn: updateTask,
    onSuccess: (response, { referenceXid }, _, context) => {
      context.client.setQueryData(taskKeys.detail(referenceXid), response);

      return context.client.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
