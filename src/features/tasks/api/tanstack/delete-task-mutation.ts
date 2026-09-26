import { useMutation } from "@tanstack/react-query";

import { deleteTask } from "@/features/tasks/api/axios/delete-task";
import { taskKeys } from "@/features/tasks/api/queries";

export const useDeleteTaskMutation = () =>
  useMutation({
    mutationFn: deleteTask,
    onSuccess: (_, referenceXid, __, context) => {
      context.client.removeQueries({ queryKey: taskKeys.detail(referenceXid), exact: true });

      return context.client.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
