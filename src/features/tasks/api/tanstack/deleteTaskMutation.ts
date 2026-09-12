import { useMutation } from "@tanstack/react-query";

import { deleteTask } from "@/features/tasks/api/axios/deleteTask";

export const useDeleteTaskMutation = () =>
  useMutation({
    mutationFn: deleteTask,
  });
