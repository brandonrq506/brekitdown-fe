import type { UseFormSetError } from "react-hook-form";

import type { GoalFormValues } from "@/features/goals/types/goal";
import { getApiValidationErrors } from "@/libs/axios";

type SetError = UseFormSetError<GoalFormValues>;

const serverError = (message: string) => ({ type: "server", message });

/**
 * Places a failed goal request on the form: `name` and `description` validation
 * errors on their own field, anything else on `root.server`. A validation error we
 * cannot render still shows `formMessage`, so a rejected request never fails silently.
 */
export const setGoalFormErrors = (error: unknown, setError: SetError, formMessage: string) => {
  const validationErrors = getApiValidationErrors(error);

  if (!validationErrors) return setError("root.server", serverError(formMessage));

  const nameError = validationErrors.name?.[0];
  const descriptionError = validationErrors.description?.[0];
  const hasNameError = nameError !== undefined;
  const hasDescriptionError = descriptionError !== undefined;
  const hasOtherError = Object.keys(validationErrors).some(
    (field) => field !== "name" && field !== "description",
  );

  if (hasNameError) setError("name", serverError(nameError), { shouldFocus: true });

  if (hasDescriptionError) {
    setError("description", serverError(descriptionError), { shouldFocus: !hasNameError });
  }

  if (hasOtherError || (!hasNameError && !hasDescriptionError)) {
    setError("root.server", serverError(formMessage));
  }
};
