import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
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
import { createGoalMutation } from "@/features/goals/api/tanstack/createGoalMutation";
import { GoalForm } from "@/features/goals/components/goal-form";
import { toGoalPayload } from "@/features/goals/utils/goal-payload";

export const CreateGoalDialog = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const createGoal = useMutation(createGoalMutation(queryClient));
  const isCreating = createGoal.isPending;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isCreating) return;

    // Closing unmounts the dialog content, which discards the draft with it.
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal={isCreating}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Create goal
      </DialogTrigger>
      <DialogContent closeButtonDisabled={isCreating}>
        <DialogHeader>
          <DialogTitle>Create goal</DialogTitle>
          <DialogDescription>
            Give your goal a clear name and an optional description.
          </DialogDescription>
        </DialogHeader>
        <GoalForm
          defaultValues={{ name: "", description: "" }}
          onSubmit={async (values) => {
            const response = await createGoal.mutateAsync(toGoalPayload(values));

            await navigate({
              to: "/goals/$goalId",
              params: { goalId: response.data.reference_xid },
            });
          }}
          onCancel={() => handleOpenChange(false)}
          submitLabel="Create goal"
          pendingLabel="Creating…"
          formErrorMessage="We couldn't create your goal. Please try again."
        />
      </DialogContent>
    </Dialog>
  );
};
