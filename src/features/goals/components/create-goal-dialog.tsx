import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { CreateDialog } from "@/components/form/create-dialog";
import { useCreateGoalMutation } from "@/features/goals/api/tanstack/use-create-goal";
import { GoalForm } from "@/features/goals/components/goal-form";
import { toGoalPayload } from "@/features/goals/utils/goal-payload";

export const CreateGoalDialog = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const createGoal = useCreateGoalMutation();
  const isCreating = createGoal.isPending;

  return (
    <CreateDialog
      open={open}
      onOpenChange={setOpen}
      pending={isCreating}
      triggerLabel="Create goal"
      title="Create goal"
      description="Give your goal a clear name and an optional description.">
      <GoalForm
        defaultValues={{ name: "", description: "" }}
        onSubmit={async (values) => {
          const response = await createGoal.mutateAsync(toGoalPayload(values));

          await navigate({
            to: "/goals/$goalId",
            params: { goalId: response.data.reference_xid },
          });
        }}
        onCancel={() => setOpen(false)}
        submitLabel="Create goal"
        pendingLabel="Creating…"
        formErrorMessage="We couldn't create your goal. Please try again."
      />
    </CreateDialog>
  );
};
