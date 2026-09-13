import { useMutation } from "@tanstack/react-query";

import { deleteTask } from "@/features/tasks/api/axios/delete-task";

export const useDeleteTaskMutation = () =>
  useMutation({
    mutationFn: deleteTask,
  });
