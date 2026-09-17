import { useMutation } from "@tanstack/react-query";

import { createTask } from "../axios/create-task";

export const useCreateTaskMutation = () =>
  useMutation({
    mutationFn: createTask,
  });
