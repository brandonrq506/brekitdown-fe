import { Button } from "@/components/ui/button";
import { useCreateTimeEntryMutation } from "@/features/time-entries/api/tanstack/use-create-time-entry";

interface Props {
  taskReferenceXid: string;
}

export const TaskCardStartBtn = ({ taskReferenceXid }: Props) => {
  const { mutate, isPending } = useCreateTimeEntryMutation();

  const handleStart = () => {
    mutate({
      taskReferenceXid,
      payload: { time_entry: { started_at: new Date().toISOString() } },
    });
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
