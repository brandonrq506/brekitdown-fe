import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { InputField, TextareaField } from "@/components/form/field-control";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { createGoalMutation } from "@/features/goals/api/tanstack/createGoalMutation";
import { GOAL_NAME_MAX_LENGTH } from "@/features/goals/constants/goal";
import type { CreateGoalFormValues } from "@/features/goals/types/goal";
import { getApiValidationErrors } from "@/libs/axios";

const defaultValues = {
  name: "",
  description: "",
} satisfies CreateGoalFormValues;

const FORM_ERROR_MESSAGE = "We couldn't create your goal. Please try again.";

export const CreateGoalDialog = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const createGoal = useMutation(createGoalMutation(queryClient));
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CreateGoalFormValues>({ defaultValues });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSubmitting) return;

    setOpen(nextOpen);

    if (!nextOpen) {
      reset(defaultValues);
      createGoal.reset();
    }
  };

  const setSubmissionError = (error: unknown) => {
    const validationErrors = getApiValidationErrors(error);

    if (!validationErrors) {
      setError("root.server", { type: "server", message: FORM_ERROR_MESSAGE });
      return;
    }

    const nameError = validationErrors.name?.[0];
    const descriptionError = validationErrors.description?.[0];
    const hasUnknownError = Object.keys(validationErrors).some(
      (field) => field !== "name" && field !== "description",
    );

    if (nameError) {
      setError("name", { type: "server", message: nameError }, { shouldFocus: true });
    }

    if (descriptionError) {
      setError(
        "description",
        { type: "server", message: descriptionError },
        { shouldFocus: !nameError },
      );
    }

    if ((!nameError && !descriptionError) || hasUnknownError) {
      setError("root.server", { type: "server", message: FORM_ERROR_MESSAGE });
    }
  };

  const onSubmit: SubmitHandler<CreateGoalFormValues> = async (values) => {
    clearErrors();

    try {
      const response = await createGoal.mutateAsync({
        goal: {
          name: values.name.trim(),
          description: values.description.trim() || null,
        },
      });

      await navigate({
        to: "/goals/$goalId",
        params: { goalId: response.data.reference_xid },
      });
    } catch (error) {
      setSubmissionError(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal={isSubmitting}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Create goal
      </DialogTrigger>
      <DialogContent closeButtonDisabled={isSubmitting}>
        <DialogHeader>
          <DialogTitle>Create goal</DialogTitle>
          <DialogDescription>
            Give your goal a clear name and an optional description.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-5">
            <InputField
              label="Name"
              description={`Use ${GOAL_NAME_MAX_LENGTH} characters or fewer.`}
              error={errors.name?.message}
              required
              maxLength={GOAL_NAME_MAX_LENGTH}
              autoComplete="off"
              {...register("name", {
                required: "Goal name is required.",
                maxLength: {
                  value: GOAL_NAME_MAX_LENGTH,
                  message: `Goal name must be ${GOAL_NAME_MAX_LENGTH} characters or fewer.`,
                },
                setValueAs: (value: string) => value.trim(),
              })}
            />
            <TextareaField
              label="Description"
              description="Add any context that will help you work toward this goal."
              error={errors.description?.message}
              rows={4}
              {...register("description")}
            />
            {errors.root?.server?.message && <FieldError>{errors.root.server.message}</FieldError>}
            <DialogFooter>
              <DialogClose
                disabled={isSubmitting}
                render={<Button type="button" variant="outline" disabled={isSubmitting} />}
              >
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create goal"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};
