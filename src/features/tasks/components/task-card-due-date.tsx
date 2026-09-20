import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { goalDetailsPageTasksQueryOptions } from "../api/queries";
import { useUpdateTaskMutation } from "../api/tanstack/use-update-task";
import type { Task } from "../types/task";
import { toUpdateTaskDueAtPayload } from "../utils/task-payload";
import { TaskDate } from "./task-date";
import { TaskDueDatePopover } from "./task-due-date-popover";

const DUE_DATE_ERROR_MESSAGE = "We couldn't update the due date. Please try again.";

interface Props {
  task: Task;
}

/** Renders the footer's due date term and description; expects the card's `dl` as its parent. */
export const TaskCardDueDate = ({ task }: Props) => {
  const { mutate, isPending, isError } = useUpdateTaskMutation();
  const dueAt = task.due_at === null ? null : new Date(task.due_at);
  const label = dueAt === null ? "Set due date" : "Change due date";

  const handleChange = (nextDueAt: Date | null) => {
    mutate(
      { referenceXid: task.reference_xid, payload: toUpdateTaskDueAtPayload(nextDueAt) },
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
    <>
      <dt className="sr-only">Due</dt>
      <dd className="flex flex-wrap items-center gap-x-2">
        <TaskDueDatePopover
          disabled={isPending}
          onChange={handleChange}
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
        {isError && (
          <span role="alert" className="text-destructive">
            {DUE_DATE_ERROR_MESSAGE}
          </span>
        )}
      </dd>
    </>
  );
};
