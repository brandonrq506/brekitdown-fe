import { useState } from "react";

import { CreateDialog } from "@/components/form/create-dialog";
import { ReopenGoalDialog } from "@/features/goals/components/reopen-goal-dialog";
import { useReopenGoalAndRetry } from "@/features/goals/hooks/use-reopen-goal-and-retry";
import { useCreateTaskMutation } from "../api/tanstack/use-create-task";
import type { TaskFormValues } from "../types/task";
import { toCreateTaskPayload } from "../utils/task-payload";
import { CreateTaskForm } from "./create-task-form";

interface Props {
  goalReferenceXid: string;
}

export const CreateTaskDialog = ({ goalReferenceXid }: Props) => {
  const [open, setOpen] = useState(false);
  const createTask = useCreateTaskMutation();
  const { handleError, dialogProps } = useReopenGoalAndRetry();
  const isCreating = createTask.isPending || dialogProps.pending;

  const submit = async (values: TaskFormValues) => {
    const payload = toCreateTaskPayload(values, goalReferenceXid);
    const retry = () => createTask.mutate(payload, { onSuccess: () => setOpen(false) });

    try {
      await createTask.mutateAsync(payload);
      setOpen(false);
    } catch (error) {
      // A completed goal's refusal becomes the reopen dialog; anything else is the form's to show.
      if (!handleError(error, goalReferenceXid, retry)) throw error;
    }
  };

  return (
    <CreateDialog
      open={open}
      onOpenChange={setOpen}
      pending={isCreating}
      triggerLabel="Create task"
      title="Create task"
      description="Give your task a title, an optional description, and a due date.">
      <CreateTaskForm onSubmit={submit} onCancel={() => setOpen(false)} />
      {/* Nested in the create dialog so Base UI stacks it instead of dismissing the form. */}
      <ReopenGoalDialog {...dialogProps} />
    </CreateDialog>
  );
};
