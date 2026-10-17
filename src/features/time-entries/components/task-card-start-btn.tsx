import { useCreateTimeEntryMutation } from "@/features/time-entries/api/tanstack/use-create-time-entry";

import { Button } from "@/components/ui/button";
import { ReopenGoalDialog } from "@/features/goals/components/reopen-goal-dialog";
import { useReopenGoalAndRetry } from "@/features/goals/hooks/use-reopen-goal-and-retry";
import type { Task } from "@/features/tasks/types/task";

interface Props {
  task: Task;
}

export const TaskCardStartBtn = ({ task }: Props) => {
  const { mutate, isPending } = useCreateTimeEntryMutation();
  const { handleError, dialogProps } = useReopenGoalAndRetry();

  const handleStart = () => {
    mutate(
      {
        taskReferenceXid: task.reference_xid,
        payload: { time_entry: { started_at: new Date().toISOString() } },
      },
      { onError: (error) => handleError(error, task.goal?.reference_xid, handleStart) },
    );
  };

  return (
    <>
      <Button
        type="button"
        variant="default"
        size="default"
        className="min-w-19.5 rounded-lg px-3.75"
        aria-label="Start"
        title="Start"
        disabled={isPending || dialogProps.pending}
        onClick={handleStart}>
        Start
      </Button>
      <ReopenGoalDialog {...dialogProps} />
    </>
  );
};
