import { useMutation } from "@tanstack/react-query";

import { updateTimeEntry } from "../axios/updateTimeEntry";

export const useUpdateTimeEntryMutation = () => {
  return useMutation({
    mutationFn: updateTimeEntry,
  });
};
