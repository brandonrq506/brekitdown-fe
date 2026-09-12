import { EllipsisIcon, Trash2Icon } from "lucide-react";

import { TASK_STATUS, type Task } from "../types/task";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { goalDetailsPageTasksQueryOptions } from "@/features/tasks/api/queries";
import { useDeleteTaskMutation } from "@/features/tasks/api/tanstack/deleteTaskMutation";
import { TaskCardStartBtn } from "@/routes/_protected/goals/-components/task-card-start-btn";
import { TaskCardStopBtn } from "@/routes/_protected/goals/-components/task-card-stop-btn";

const DELETE_ERROR_MESSAGE = "We couldn't delete this task. Please try again.";

type TimerAction =
  | {
      type: "start";
    }
  | {
      type: "stop";
      entryReferenceXid: string;
    };

interface Props {
  task: Task;
}

const getTimerAction = (task: Task): TimerAction | null => {
  if (task.status === TASK_STATUS.COMPLETED || task.has_children) return null;

  const runningTimeEntry = task.time_entries.find((entry) => entry.ended_at === null);
  if (runningTimeEntry === undefined) return { type: "start" };

  return {
    type: "stop",
    entryReferenceXid: runningTimeEntry.reference_xid,
  };
};

export const TaskCardActions = ({ task }: Props) => {
  const { mutate, isPending, isError } = useDeleteTaskMutation();
  const timerAction = getTimerAction(task);
  const actionsLabel = `Task actions for ${task.name}`;

  const handleDelete = () => {
    mutate(task.reference_xid, {
      async onSuccess(_, __, ___, context) {
        await context.client.invalidateQueries(
          goalDetailsPageTasksQueryOptions(task.goal_reference_xid),
        );
      },
    });
  };

  return (
    <>
      <div className="col-start-2 flex items-center gap-2 sm:col-start-3 sm:row-start-1">
        {timerAction?.type === "stop" && (
          <TaskCardStopBtn task={task} entryReferenceXid={timerAction.entryReferenceXid} />
        )}
        {timerAction?.type === "start" && <TaskCardStartBtn task={task} />}
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={isPending}
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={actionsLabel}
                title={actionsLabel}
              />
            }
          >
            <EllipsisIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              disabled={isPending}
              closeOnClick
              onClick={handleDelete}
            >
              <Trash2Icon />
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isError && (
        <p role="alert" className="col-span-2 col-start-1 text-sm text-destructive sm:col-start-2">
          {DELETE_ERROR_MESSAGE}
        </p>
      )}
    </>
  );
};
