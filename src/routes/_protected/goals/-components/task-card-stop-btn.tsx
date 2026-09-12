import { Button } from "@/components/ui/button";
import { useUpdateTimeEntryMutation } from "@/features/time-entries/api/tanstack/use-update-time-entry";

interface Props {
  taskReferenceXid: string;
  entryReferenceXid: string;
}

export const TaskCardStopBtn = ({ taskReferenceXid, entryReferenceXid }: Props) => {
  const { mutate, isPending } = useUpdateTimeEntryMutation();

  const handleStop = () => {
    mutate({
      taskReferenceXid,
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
      onClick={handleStop}
    >
      Stop
    </Button>
  );
};
