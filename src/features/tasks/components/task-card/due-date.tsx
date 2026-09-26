import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUpdateTaskMutation } from "../../api/tanstack/use-update-task";
import { toUpdateTaskDueAtPayload } from "../../utils/task-payload";
import { TaskDate } from "../task-date";
import { TaskDueDatePopover } from "../task-due-date-popover";
import { useTaskCard } from "./context";

/** Expects the Footer's `dl` as its parent. */
export const DueDate = () => {
  const { task } = useTaskCard();
  const { mutate, isPending } = useUpdateTaskMutation();
  const dueAt = task.due_at === null ? null : new Date(task.due_at);
  const label = dueAt === null ? "Set due date" : "Change due date";

  return (
    <div className="flex flex-wrap items-center gap-x-2">
      <dt className="sr-only">Due</dt>
      <dd className="flex flex-wrap items-center gap-x-2">
        <TaskDueDatePopover
          disabled={isPending}
          onChange={(nextDueAt) =>
            mutate({
              referenceXid: task.reference_xid,
              payload: toUpdateTaskDueAtPayload(nextDueAt),
            })
          }
          value={dueAt}
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={label}
              title={label}
              className="h-11 px-2 text-xs text-muted-foreground sm:h-8"
            />
          }>
          <CalendarIcon aria-hidden="true" className="size-3.5" />
        </TaskDueDatePopover>
        {task.due_at === null ? "No due date" : <TaskDate timestamp={task.due_at} />}
      </dd>
    </div>
  );
};
