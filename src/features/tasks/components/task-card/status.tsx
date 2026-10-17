import { ReopenGoalDialog } from "@/features/goals/components/reopen-goal-dialog";
import { useReopenGoalAndRetry } from "@/features/goals/hooks/use-reopen-goal-and-retry";
import { useUpdateTaskMutation } from "../../api/tanstack/use-update-task";
import { TASK_STATUS_PRESENTATION } from "../../constants/task-status-presentation";
import type { TASK_STATUS } from "../../types/task";
import { toUpdateTaskStatusPayload } from "../../utils/task-payload";
import { TaskStatusMenu } from "../task-status-menu";
import { useTaskCard } from "./context";

/** Expects the Header's grid as its parent. */
export const Status = () => {
  const { task } = useTaskCard();
  const { mutate, isPending } = useUpdateTaskMutation();
  const { handleError, dialogProps } = useReopenGoalAndRetry();
  const { label, icon: StatusIcon } = TASK_STATUS_PRESENTATION[task.status];

  const changeStatus = (status: TASK_STATUS) =>
    mutate(
      { referenceXid: task.reference_xid, payload: toUpdateTaskStatusPayload(status) },
      {
        onError: (error) =>
          handleError(error, task.goal?.reference_xid, () => changeStatus(status)),
      },
    );

  return (
    <>
      <TaskStatusMenu
        value={task.status}
        disabled={isPending || dialogProps.pending}
        onValueChange={changeStatus}
        trigger={
          <button
            type="button"
            aria-label={`Status: ${label}`}
            title={label}
            className="mt-0.5 shrink-0 rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          />
        }>
        <StatusIcon aria-hidden="true" className="size-5" />
      </TaskStatusMenu>
      <ReopenGoalDialog {...dialogProps} />
    </>
  );
};
