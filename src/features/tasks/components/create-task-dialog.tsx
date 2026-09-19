import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { goalDetailsPageTasksQueryOptions } from "../api/queries";
import { useCreateTaskMutation } from "../api/tanstack/use-create-task";
import { toCreateTaskPayload } from "../utils/task-payload";
import { CreateTaskCard } from "./create-task-card";

interface Props {
  goalReferenceXid: string;
}

export const CreateTaskDialog = ({ goalReferenceXid }: Props) => {
  const [open, setOpen] = useState(false);
  const createTask = useCreateTaskMutation();
  const isCreating = createTask.isPending;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isCreating) return;
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal={isCreating}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Create task
      </DialogTrigger>
      <DialogContent
        closeButtonDisabled={isCreating}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>
            Give your task a title, an optional description, and a due date.
          </DialogDescription>
        </DialogHeader>
        <CreateTaskCard
          onSubmit={async (values) => {
            await createTask.mutateAsync(toCreateTaskPayload(values, goalReferenceXid), {
              async onSuccess(_, __, ___, context) {
                await context.client.invalidateQueries(
                  goalDetailsPageTasksQueryOptions(goalReferenceXid),
                );
              },
            });
            setOpen(false);
          }}
          onCancel={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
