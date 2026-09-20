import { useMutation } from "@tanstack/react-query";

import { updateTask } from "../axios/update-task";

export const useUpdateTaskMutation = () =>
  useMutation({
    mutationFn: updateTask,
  });
