import { useState } from "react";

import { CreateDialog } from "@/components/form/create-dialog";
import { useCreateTaskMutation } from "../api/tanstack/use-create-task";
import { toCreateTaskPayload } from "../utils/task-payload";
import { CreateTaskForm } from "./create-task-form";

interface Props {
  goalReferenceXid: string;
}

export const CreateTaskDialog = ({ goalReferenceXid }: Props) => {
  const [open, setOpen] = useState(false);
  const createTask = useCreateTaskMutation();
  const isCreating = createTask.isPending;

  return (
    <CreateDialog
      open={open}
      onOpenChange={setOpen}
      pending={isCreating}
      triggerLabel="Create task"
      title="Create task"
      description="Give your task a title, an optional description, and a due date.">
      <CreateTaskForm
        onSubmit={async (values) => {
          await createTask.mutateAsync(toCreateTaskPayload(values, goalReferenceXid));
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </CreateDialog>
  );
};
