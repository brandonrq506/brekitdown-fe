import { TargetIcon } from "lucide-react";
import { useId } from "react";

import type { Goal } from "../types/goal";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type GoalCardProps = {
  goal: Goal;
};

export const GoalCard = ({ goal }: GoalCardProps) => {
  const titleId = useId();
  const hasDescription = Boolean(goal.description?.trim());

  return (
    <Card role="article" aria-labelledby={titleId} className="h-full">
      <CardHeader className="gap-4">
        <div
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
        >
          <TargetIcon className="size-5" />
        </div>
        <div className="space-y-1.5">
          <CardTitle>
            <h2 id={titleId} className="text-balance break-words">
              {goal.name}
            </h2>
          </CardTitle>
          <CardDescription className={hasDescription ? "break-words" : "italic"}>
            {hasDescription ? goal.description : "No description yet."}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
};
