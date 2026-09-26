import { Button } from "@/components/ui/button";
import type { Task } from "@/features/tasks/types/task";
import { useUpdateTimeEntryMutation } from "@/features/time-entries/api/tanstack/use-update-time-entry";

interface Props {
  task: Task;
  entryReferenceXid: string;
}

export const TaskCardStopBtn = ({ task, entryReferenceXid }: Props) => {
  const { mutate, isPending } = useUpdateTimeEntryMutation();

  const handleStop = () => {
    mutate({
      taskReferenceXid: task.reference_xid,
      entryReferenceXid,
      payload: { time_entry: { ended_at: new Date().toISOString() } },
    });
  };

  return (
    <Button
      type="button"
      variant="default"
      size="default"
      className="min-w-19.5 rounded-lg px-3.75"
      aria-label="Stop"
      title="Stop"
      disabled={isPending}
      onClick={handleStop}>
      Stop
    </Button>
  );
};
