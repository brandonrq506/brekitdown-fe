import { AxiosError, AxiosHeaders } from "axios";
import type { UseFormSetError } from "react-hook-form";

import { setGoalFormErrors } from "./goal-form-errors";
import { HTTP_STATUS } from "@/constants/http";
import type { GoalFormValues } from "@/features/goals/types/goal";

const FORM_MESSAGE = "We couldn't create your goal. Please try again.";

const apiFailure = (status: number, data: unknown) =>
  new AxiosError("Request failed", AxiosError.ERR_BAD_REQUEST, undefined, undefined, {
    status,
    statusText: "Request failed",
    data,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });

const validationFailure = (errors: Record<string, string[]>) =>
  apiFailure(HTTP_STATUS.UNPROCESSABLE_ENTITY, { errors });

const setup = () => vi.fn<UseFormSetError<GoalFormValues>>();

it("places a field validation error on its field and focuses it", () => {
  const setError = setup();

  setGoalFormErrors(
    validationFailure({ name: ["has already been taken"] }),
    setError,
    FORM_MESSAGE,
  );

  expect(setError).toHaveBeenCalledTimes(1);
  expect(setError).toHaveBeenCalledWith(
    "name",
    { type: "server", message: "has already been taken" },
    { shouldFocus: true },
  );
});

it("focuses only the first errored field", () => {
  const setError = setup();

  setGoalFormErrors(
    validationFailure({ name: ["is invalid"], description: ["is too long"] }),
    setError,
    FORM_MESSAGE,
  );

  expect(setError).toHaveBeenCalledTimes(2);
  expect(setError).toHaveBeenNthCalledWith(1, "name", expect.anything(), { shouldFocus: true });
  expect(setError).toHaveBeenNthCalledWith(2, "description", expect.anything(), {
    shouldFocus: false,
  });
});

it("surfaces the form message when a validation error has no field to render it", () => {
  const setError = setup();

  setGoalFormErrors(
    validationFailure({ name: ["is invalid"], owner_id: ["is invalid"] }),
    setError,
    FORM_MESSAGE,
  );

  expect(setError).toHaveBeenCalledWith("root.server", {
    type: "server",
    message: FORM_MESSAGE,
  });
});

it("places a non-validation failure on the form", () => {
  const setError = setup();

  setGoalFormErrors(
    apiFailure(500, { errors: { detail: "Internal Server Error" } }),
    setError,
    FORM_MESSAGE,
  );

  expect(setError).toHaveBeenCalledTimes(1);
  expect(setError).toHaveBeenCalledWith("root.server", { type: "server", message: FORM_MESSAGE });
});
