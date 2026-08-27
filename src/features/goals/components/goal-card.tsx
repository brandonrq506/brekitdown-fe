import { TargetIcon } from "lucide-react";
import { useId } from "react";
import { Link } from "@tanstack/react-router";

import type { Goal } from "../types/goal";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type GoalCardProps = {
  goal: Goal;
};

export const GoalCard = ({ goal }: GoalCardProps) => {
  const titleId = useId();
  const hasDescription = Boolean(goal.description?.trim());

  return (
    <Link
      to="/goals/$goalId"
      params={{ goalId: goal.reference_xid }}
      className="group/goal block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <Card
        role="article"
        aria-labelledby={titleId}
        className="h-full transition-[transform,box-shadow] group-hover/goal:-translate-y-0.5 group-hover/goal:shadow-md"
      >
        <CardHeader className="gap-4">
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
        </CardHeader>
      </Card>
    </Link>
  );
};
