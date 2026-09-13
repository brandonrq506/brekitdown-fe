import { useMutation } from "@tanstack/react-query";

import { createTimeEntry } from "../axios/create-time-entry";

export const useCreateTimeEntryMutation = () => {
  return useMutation({
    mutationFn: createTimeEntry,
  });
};
