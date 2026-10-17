import { useState } from "react";
import { CircleCheckIcon, EllipsisIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompleteGoalMutation } from "@/features/goals/api/tanstack/use-complete-goal";
import { useReopenGoalMutation } from "@/features/goals/api/tanstack/use-reopen-goal";
import { CompleteGoalDialog } from "@/features/goals/components/complete-goal-dialog";
import type { Goal } from "@/features/goals/types/goal";
import type { Task } from "@/features/tasks/types/task";
import { countOpenTasks } from "@/features/tasks/utils/count-open-tasks";

type GoalMenuProps = {
  goal: Goal;
  /** Every Task of the goal, subtasks and closed ones included. */
  tasks: readonly Task[];
};

/**
 * The Goal details ellipsis menu: mark as completed, or reopen once the goal is completed.
 * A goal with Open tasks asks for confirmation first, since completing drops them.
 * Reopening needs no confirmation: it only clears the completion.
 */
export const GoalMenu = ({ goal, tasks }: GoalMenuProps) => {
  const { mutate, isPending: isCompleting } = useCompleteGoalMutation();
  const { mutate: reopen, isPending: isReopening } = useReopenGoalMutation();
  const [isConfirming, setIsConfirming] = useState(false);
  const menuLabel = `Goal actions for ${goal.name}`;
  const isPending = isCompleting || isReopening;
  const isCompleted = goal.completed_at !== null;

  const openTaskCounts = countOpenTasks(tasks);
  const hasOpenTasks = Object.values(openTaskCounts).some((count) => count > 0);

  const complete = () => mutate(goal.reference_xid, { onSuccess: () => setIsConfirming(false) });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isPending}
          render={
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={menuLabel}
              title={menuLabel}
            />
          }>
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isCompleted ? (
            <DropdownMenuItem
              disabled={isPending}
              closeOnClick
              onClick={() => reopen(goal.reference_xid)}>
              <RotateCcwIcon />
              Reopen
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={isPending}
              closeOnClick
              onClick={() => (hasOpenTasks ? setIsConfirming(true) : complete())}>
              <CircleCheckIcon />
              Mark as completed
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <CompleteGoalDialog
        open={isConfirming}
        onOpenChange={setIsConfirming}
        openTaskCounts={openTaskCounts}
        pending={isCompleting}
        onConfirm={complete}
      />
    </>
  );
};
