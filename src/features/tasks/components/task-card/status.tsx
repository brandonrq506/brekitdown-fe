import { useUpdateTaskMutation } from "../../api/tanstack/use-update-task";
import { TASK_STATUS_PRESENTATION } from "../../constants/task-status-presentation";
import { toUpdateTaskStatusPayload } from "../../utils/task-payload";
import { TaskStatusMenu } from "../task-status-menu";
import { useTaskCard } from "./context";

/** Expects the Header's grid as its parent. */
export const Status = () => {
  const { task } = useTaskCard();
  const { mutate, isPending } = useUpdateTaskMutation();
  const { label, icon: StatusIcon } = TASK_STATUS_PRESENTATION[task.status];

  return (
    <TaskStatusMenu
      value={task.status}
      disabled={isPending}
      onValueChange={(status) =>
        mutate({ referenceXid: task.reference_xid, payload: toUpdateTaskStatusPayload(status) })
      }
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
  );
};
