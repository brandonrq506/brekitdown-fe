import { TargetIcon } from "lucide-react";

import { GoalCard } from "./goal-card";
import type { Goal } from "../types/goal";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

type GoalsGridProps = {
  goals: Goal[];
};

export const GoalsGrid = ({ goals }: GoalsGridProps) => {
  if (goals.length === 0) {
    return (
      <section aria-label="Goals">
        <Card className="border border-dashed bg-muted/30 py-12 shadow-none ring-0">
          <CardContent className="items-center text-center">
            <div
              aria-hidden="true"
              className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
            >
              <TargetIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <CardTitle>
                <h2>No goals yet</h2>
              </CardTitle>
              <CardDescription>Goals you create will show up here.</CardDescription>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section aria-label="Goals" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal) => (
        <GoalCard key={goal.reference_xid} goal={goal} />
      ))}
    </section>
  );
};
