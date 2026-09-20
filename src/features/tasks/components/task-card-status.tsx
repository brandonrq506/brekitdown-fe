import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { goalDetailsPageTasksQueryOptions } from "../api/queries";
import { useUpdateTaskMutation } from "../api/tanstack/use-update-task";
import { TASK_STATUS_PRESENTATION } from "../constants/task-status-presentation";
import type { Task, TASK_STATUS } from "../types/task";
import { toUpdateTaskStatusPayload } from "../utils/task-payload";

const STATUS_ERROR_MESSAGE = "We couldn't update the status. Please try again.";

interface Props {
  task: Task;
}

/** Renders the card's status control; expects the card header's grid as its parent. */
export const TaskCardStatus = ({ task }: Props) => {
  const { mutate, isPending, isError } = useUpdateTaskMutation();
  const { label, icon: StatusIcon } = TASK_STATUS_PRESENTATION[task.status];
  const triggerLabel = `Status: ${label}`;

  const handleValueChange = (value: string) => {
    const status = value as TASK_STATUS;

    if (status === task.status) return;

    mutate(
      { referenceXid: task.reference_xid, payload: toUpdateTaskStatusPayload(status) },
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
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isPending}
          render={
            <button
              type="button"
              aria-label={triggerLabel}
              title={label}
              className="mt-0.5 shrink-0 rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            />
          }>
          <StatusIcon aria-hidden="true" className="size-5" />
        </DropdownMenuTrigger>
        {/* The popup would otherwise take the trigger's width, which is one icon wide. */}
        <DropdownMenuContent className="w-44">
          <DropdownMenuRadioGroup value={task.status} onValueChange={handleValueChange}>
            {Object.entries(TASK_STATUS_PRESENTATION).map(([value, presentation]) => {
              const ItemIcon = presentation.icon;

              return (
                <DropdownMenuRadioItem key={value} value={value} closeOnClick>
                  <ItemIcon aria-hidden="true" />
                  {presentation.label}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {isError && (
        <p role="alert" className="col-span-2 col-start-1 text-sm text-destructive sm:col-start-2">
          {STATUS_ERROR_MESSAGE}
        </p>
      )}
    </>
  );
};
