import { useMutation } from "@tanstack/react-query";

import { updateTimeEntry } from "../axios/update-time-entry";

export const useUpdateTimeEntryMutation = () => {
  return useMutation({
    mutationFn: updateTimeEntry,
  });
};
