import { useMutation } from "@tanstack/react-query";

import { createTimeEntry } from "../axios/createTimeEntry";

export const useCreateTimeEntryMutation = () => {
  return useMutation({
    mutationFn: createTimeEntry,
  });
};
