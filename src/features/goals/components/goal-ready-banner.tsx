import { PartyPopperIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCompleteGoalMutation } from "@/features/goals/api/tanstack/use-complete-goal";
import type { Goal } from "@/features/goals/types/goal";
import { isGoalReadyToComplete } from "@/features/goals/utils/is-goal-ready-to-complete";
import type { Task } from "@/features/tasks/types/task";

type GoalReadyBannerProps = {
  goal: Goal;
  /** Every Task of the goal, subtasks and closed ones included. */
  tasks: readonly Task[];
};

/**
 * Offers to complete the goal once it is ready. Shows on every visit while that holds;
 * the goal is never completed without the user's click.
 */
export const GoalReadyBanner = ({ goal, tasks }: GoalReadyBannerProps) => {
  const { mutate, isPending } = useCompleteGoalMutation();

  if (!isGoalReadyToComplete(goal, tasks)) return null;

  return (
    <section
      aria-label="Goal ready to complete"
      className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <PartyPopperIcon aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
        <p className="text-sm">Every task is closed. Ready to mark this goal as completed?</p>
      </div>
      <Button
        type="button"
        size="sm"
        disabled={isPending}
        onClick={() => mutate(goal.reference_xid)}>
        Mark as completed
      </Button>
    </section>
  );
};
