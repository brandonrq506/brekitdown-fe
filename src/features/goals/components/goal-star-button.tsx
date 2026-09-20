import { StarIcon } from "lucide-react";

import type { Goal } from "../types/goal";
import { Button } from "@/components/ui/button";
import { useUpdateGoalMutation } from "@/features/goals/api/tanstack/use-update-goal";
import { cn } from "@/utils/cn";

type GoalStarButtonProps = {
  goal: Goal;
};

export const GoalStarButton = ({ goal }: GoalStarButtonProps) => {
  const updateGoal = useUpdateGoalMutation();
  const starredAt =
    updateGoal.data === undefined ? goal.starred_at : updateGoal.data.data.starred_at;
  const isStarred = starredAt !== null;
  const actionLabel = `${isStarred ? "Unstar" : "Star"} ${goal.name}`;

  const handleClick = () => {
    updateGoal.mutate({
      referenceXid: goal.reference_xid,
      payload: { goal: { starred_at: isStarred ? null : new Date().toISOString() } },
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={actionLabel}
      aria-pressed={isStarred}
      title={actionLabel}
      disabled={updateGoal.isPending}
      onClick={handleClick}
      className={cn(
        "text-muted-foreground hover:text-amber-600",
        isStarred && "text-amber-500 hover:text-amber-600",
      )}>
      <StarIcon className={cn(isStarred && "fill-current")} />
    </Button>
  );
};
