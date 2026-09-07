import { useForm, type SubmitHandler } from "react-hook-form";

import { InputField, TextareaField } from "@/components/form/field-control";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { GOAL_NAME_MAX_LENGTH } from "@/features/goals/constants/goal";
import type { GoalFormValues } from "@/features/goals/types/goal";
import { setGoalFormErrors } from "@/features/goals/utils/goal-form-errors";

interface Props {
  defaultValues: GoalFormValues;
  onSubmit: (values: GoalFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  pendingLabel: string;
  formErrorMessage: string;
}

/**
 * Owns the goal field set and its validation rules, so every goal form agrees on
 * them. Callers own what a submission does.
 */
export const GoalForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
  pendingLabel,
  formErrorMessage,
}: Props) => {
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<GoalFormValues>({ defaultValues });

  const formError = errors.root?.server?.message;

  const submit: SubmitHandler<GoalFormValues> = async (values) => {
    clearErrors();

    try {
      await onSubmit(values);
    } catch (error) {
      setGoalFormErrors(error, setError, formErrorMessage);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(submit)}>
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
        {formError !== undefined && <FieldError>{formError}</FieldError>}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? pendingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  );
};
