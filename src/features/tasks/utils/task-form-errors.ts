import type { UseFormSetError } from "react-hook-form";

import type { TaskFormValues } from "../types/task";
import { getApiValidationErrors } from "@/libs/axios";

const FORM_ERROR = "We couldn't create your task. Please try again.";
const serverError = (message: string) => ({ type: "server", message });

export const setTaskFormErrors = (error: unknown, setError: UseFormSetError<TaskFormValues>) => {
  const validationErrors = getApiValidationErrors(error);
  if (!validationErrors) return setError("root.server", serverError(FORM_ERROR));

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
    setError("root.server", serverError(FORM_ERROR));
  }
};
