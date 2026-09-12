import { useCreateTimeEntryMutation } from "@/features/time-entries/api/tanstack/use-create-time-entry";

import { Button } from "@/components/ui/button";
import { goalDetailsPageTasksQueryOptions } from "@/features/tasks/api/queries";
import type { Task } from "@/features/tasks/types/task";

interface Props {
  task: Task;
}

export const TaskCardStartBtn = ({ task }: Props) => {
  const { mutate, isPending } = useCreateTimeEntryMutation();

  const handleStart = () => {
    mutate(
      {
        taskReferenceXid: task.reference_xid,
        payload: { time_entry: { started_at: new Date().toISOString() } },
      },
      {
        async onSuccess(_, __, ___, context) {
          await context.client.invalidateQueries(
            goalDetailsPageTasksQueryOptions(task.goal_reference_xid),
          );
        },
      },
    );
  };

  return (
    <Button
      type="button"
      variant="default"
      size="default"
      className="min-w-19.5 rounded-lg px-3.75"
      aria-label="Start"
      title="Start"
      disabled={isPending}
      onClick={handleStart}
    >
      Start
    </Button>
  );
};
