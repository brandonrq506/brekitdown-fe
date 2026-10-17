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

type ReopenGoalDialogProps = {
  open: boolean;
  /** Dismissal while not pending: the blocked action is dropped and nothing changes. */
  onCancel: () => void;
  pending: boolean;
  onConfirm: () => void;
};

/** Asks before an action that needs the goal reopened, since that removes its completed status. */
export const ReopenGoalDialog = ({ open, onCancel, pending, onConfirm }: ReopenGoalDialogProps) => {
  // No trigger: the dialog only ever asks to close.
  const handleOpenChange = () => {
    if (!pending) onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal={pending}>
      <DialogContent closeButtonDisabled={pending}>
        <DialogHeader>
          <DialogTitle>Reopen this goal?</DialogTitle>
          <DialogDescription>
            This goal is completed. Continuing will remove its completed status.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose disabled={pending} render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button disabled={pending} onClick={onConfirm}>
            Reopen and continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
