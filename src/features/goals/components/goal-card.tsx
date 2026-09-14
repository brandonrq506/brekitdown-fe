import { TargetIcon } from "lucide-react";
import { useId } from "react";
import { Link } from "@tanstack/react-router";

import { GoalStarButton } from "./goal-star-button";
import type { Goal } from "../types/goal";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type GoalCardProps = {
  goal: Goal;
};

export const GoalCard = ({ goal }: GoalCardProps) => {
  const titleId = useId();
  const hasDescription = Boolean(goal.description?.trim());

  return (
    <Card
      role="article"
      aria-labelledby={titleId}
      className="h-full transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md"
    >
      <CardHeader>
        <Link
          to="/goals/$goalId"
          params={{ goalId: goal.reference_xid }}
          className="grid gap-4 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <div
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
          >
            <TargetIcon className="size-5" />
          </div>
          <div className="space-y-1.5">
            <CardTitle>
              <h2 id={titleId} className="text-balance wrap-break-word">
                {goal.name}
              </h2>
            </CardTitle>
            <CardDescription className={hasDescription ? "wrap-break-word" : "italic"}>
              {hasDescription ? goal.description : "No description yet."}
            </CardDescription>
          </div>
        </Link>
        <CardAction>
          <GoalStarButton goal={goal} />
        </CardAction>
      </CardHeader>
    </Card>
  );
};
