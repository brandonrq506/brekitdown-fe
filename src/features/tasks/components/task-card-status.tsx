import { useUpdateTaskMutation } from "../api/tanstack/use-update-task";
import { TASK_STATUS_PRESENTATION } from "../constants/task-status-presentation";
import type { Task } from "../types/task";
import { toUpdateTaskStatusPayload } from "../utils/task-payload";
import { TaskStatusMenu } from "./task-status-menu";

const STATUS_ERROR_MESSAGE = "We couldn't update the status. Please try again.";

interface Props {
  task: Task;
}

/** Renders the card's status control; expects the card header's grid as its parent. */
export const TaskCardStatus = ({ task }: Props) => {
  const { mutate, isPending, isError } = useUpdateTaskMutation();
  const { label, icon: StatusIcon } = TASK_STATUS_PRESENTATION[task.status];
  const triggerLabel = `Status: ${label}`;

  return (
    <>
      <TaskStatusMenu
        value={task.status}
        disabled={isPending}
        onValueChange={(status) =>
          mutate({ referenceXid: task.reference_xid, payload: toUpdateTaskStatusPayload(status) })
        }
        trigger={
          <button
            type="button"
            aria-label={triggerLabel}
            title={label}
            className="mt-0.5 shrink-0 rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          />
        }>
        <StatusIcon aria-hidden="true" className="size-5" />
      </TaskStatusMenu>
      {isError && (
        <p role="alert" className="col-span-2 col-start-1 text-sm text-destructive sm:col-start-2">
          {STATUS_ERROR_MESSAGE}
        </p>
      )}
    </>
  );
};
