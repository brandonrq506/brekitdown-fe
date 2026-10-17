import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TASK_STATUS_PRESENTATION } from "@/features/tasks/constants/task-status-presentation";
import type { OpenTaskCounts } from "@/features/tasks/utils/count-open-tasks";
import { OPEN_TASK_STATUSES } from "@/features/tasks/utils/task-status";

type CompleteGoalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openTaskCounts: OpenTaskCounts;
  pending: boolean;
  onConfirm: () => void;
};

/** Warns that completing a goal switches its Open tasks to Dropped, with a count per status. */
export const CompleteGoalDialog = ({
  open,
  onOpenChange,
  openTaskCounts,
  pending,
  onConfirm,
}: CompleteGoalDialogProps) => {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && pending) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal={pending}>
      <DialogContent closeButtonDisabled={pending}>
        <DialogHeader>
          <DialogTitle>Complete goal with open tasks?</DialogTitle>
          <DialogDescription>
            This goal still has open tasks. Completing it will switch them to Dropped.
          </DialogDescription>
        </DialogHeader>
        <ul aria-label="Open tasks" className="flex flex-col gap-2">
          {OPEN_TASK_STATUSES.filter((status) => openTaskCounts[status] > 0).map((status) => {
            const { label, icon: Icon } = TASK_STATUS_PRESENTATION[status];

            return (
              <li key={status} className="flex items-center gap-2">
                <Icon aria-hidden className="size-4 text-muted-foreground" />
                {openTaskCounts[status]} {label}
              </li>
            );
          })}
        </ul>
        <DialogFooter>
          <DialogClose disabled={pending} render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button variant="destructive" disabled={pending} onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
