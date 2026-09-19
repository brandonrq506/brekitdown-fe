import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { CircleIcon } from "lucide-react";

import { InputField, TextareaField } from "@/components/form/field-control";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { TASK_DESCRIPTION_MAX_LENGTH, TASK_NAME_MAX_LENGTH } from "../constants/task";
import type { TaskFormValues } from "../types/task";
import { setTaskFormErrors } from "../utils/task-form-errors";
import { TaskDueDatePicker } from "./task-due-date-picker";

interface Props {
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel: () => void;
}

/** Owns the draft and validation; the caller owns persistence and dismissal. */
export const CreateTaskForm = ({ onSubmit, onCancel }: Props) => {
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<TaskFormValues>({
    defaultValues: { name: "", description: "", dueAt: null },
  });

  const submit: SubmitHandler<TaskFormValues> = async (values) => {
    clearErrors();
    try {
      await onSubmit(values);
    } catch (error) {
      setTaskFormErrors(error, setError);
    }
  };

  return (
    <form noValidate aria-label="New task" aria-busy={isSubmitting} onSubmit={handleSubmit(submit)}>
      <FieldGroup className="gap-4">
        <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-start gap-3">
          <CircleIcon aria-hidden="true" className="mt-2 size-5 text-muted-foreground" />
          <InputField
            label="Task title"
            placeholder="Task title"
            error={errors.name?.message}
            required
            autoComplete="off"
            autoFocus
            readOnly={isSubmitting}
            className="h-auto rounded-sm border-0 bg-transparent px-1 py-1 text-xl font-medium shadow-none focus-visible:border-transparent focus-visible:bg-muted/40 focus-visible:ring-0 md:text-xl dark:bg-transparent"
            {...register("name", {
              required: "Task title is required.",
              maxLength: {
                value: TASK_NAME_MAX_LENGTH,
                message: `Task title must be ${TASK_NAME_MAX_LENGTH} characters or fewer.`,
              },
              setValueAs: (value: string) => value.trim(),
            })}
          />
        </div>
        <TextareaField
          label="Description"
          placeholder="Add a description…"
          error={errors.description?.message}
          rows={4}
          readOnly={isSubmitting}
          className="min-h-24 resize-none rounded-sm border-0 bg-transparent px-1 py-1 shadow-none focus-visible:border-transparent focus-visible:bg-muted/40 focus-visible:ring-0 dark:bg-transparent"
          {...register("description", {
            maxLength: {
              value: TASK_DESCRIPTION_MAX_LENGTH,
              message: `Description must be ${TASK_DESCRIPTION_MAX_LENGTH} characters or fewer.`,
            },
          })}
        />
        <Controller
          control={control}
          name="dueAt"
          render={({ field }) => (
            <TaskDueDatePicker
              disabled={isSubmitting}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.root?.server?.message !== undefined && (
          <FieldError>{errors.root.server.message}</FieldError>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create task"}
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  );
};
