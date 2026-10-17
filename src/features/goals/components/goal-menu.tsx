import { CircleCheckIcon, EllipsisIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompleteGoalMutation } from "@/features/goals/api/tanstack/use-complete-goal";
import type { Goal } from "@/features/goals/types/goal";

type GoalMenuProps = {
  goal: Goal;
};

/** The Goal details ellipsis menu: mark as completed (hidden once the goal is completed). */
export const GoalMenu = ({ goal }: GoalMenuProps) => {
  const { mutate, isPending } = useCompleteGoalMutation();
  const menuLabel = `Goal actions for ${goal.name}`;

  if (goal.completed_at !== null) return null;

  return (
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
        <DropdownMenuItem
          disabled={isPending}
          closeOnClick
          onClick={() => mutate(goal.reference_xid)}>
          <CircleCheckIcon />
          Mark as completed
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
