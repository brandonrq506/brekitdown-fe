import { useForm, type SubmitHandler } from "react-hook-form";
import { CircleIcon } from "lucide-react";

import { InputField, TextareaField } from "@/components/form/field-control";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { TASK_DESCRIPTION_MAX_LENGTH, TASK_NAME_MAX_LENGTH } from "../constants/task";
import type { TaskFormValues } from "../types/task";
import { setTaskFormErrors } from "../utils/task-form-errors";

interface Props {
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel: () => void;
}

/** Owns the draft and validation; the caller owns persistence and dismissal. */
export const CreateTaskCard = ({ onSubmit, onCancel }: Props) => {
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<TaskFormValues>({ defaultValues: { name: "", description: "" } });

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
      <Card className="gap-5 bg-transparent p-0 shadow-none ring-0">
        <CardHeader className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-start gap-3 px-0">
          <CircleIcon aria-hidden="true" className="mt-2 size-5 text-muted-foreground" />
          <InputField
            label="Task title"
            placeholder="Task title"
            error={errors.name?.message}
            required
            maxLength={TASK_NAME_MAX_LENGTH}
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
        </CardHeader>
        <CardContent className="px-0 sm:ml-8">
          <TextareaField
            label="Description"
            placeholder="Add a description…"
            error={errors.description?.message}
            rows={4}
            maxLength={TASK_DESCRIPTION_MAX_LENGTH}
            readOnly={isSubmitting}
            className="min-h-24 resize-y rounded-sm border-0 bg-transparent px-1 py-1 shadow-none focus-visible:border-transparent focus-visible:bg-muted/40 focus-visible:ring-0 dark:bg-transparent"
            {...register("description", {
              maxLength: {
                value: TASK_DESCRIPTION_MAX_LENGTH,
                message: `Description must be ${TASK_DESCRIPTION_MAX_LENGTH} characters or fewer.`,
              },
            })}
          />
          {errors.root?.server?.message !== undefined && (
            <FieldError>{errors.root.server.message}</FieldError>
          )}
        </CardContent>
        <CardFooter className="flex-col-reverse gap-2 border-t px-0 pt-4 sm:ml-8 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create task"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};
