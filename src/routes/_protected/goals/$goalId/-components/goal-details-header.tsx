import { GoalCompletedAt } from "@/features/goals/components/goal-completed-at";
import { GoalMenu } from "@/features/goals/components/goal-menu";
import { GoalReadyBanner } from "@/features/goals/components/goal-ready-banner";
import { GoalStarButton } from "@/features/goals/components/goal-star-button";
import type { Goal } from "@/features/goals/types/goal";
import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import type { Task } from "@/features/tasks/types/task";

type GoalDetailsHeaderProps = {
  goal: Goal;
  /** Every Task of the goal, subtasks and closed ones included. */
  tasks: readonly Task[];
};

export const GoalDetailsHeader = ({ goal, tasks }: GoalDetailsHeaderProps) => (
  <header className="space-y-4 border-b pb-6">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <h1 className="text-4xl font-medium tracking-tight wrap-break-word">{goal.name}</h1>
        {/* Won't be needed once we make description non-null */}
        {Boolean(goal.description?.trim()) && (
          <p className="text-sm wrap-break-word whitespace-pre-wrap text-muted-foreground">
            {goal.description}
          </p>
        )}
        <GoalCompletedAt completedAt={goal.completed_at} />
      </div>
      <div className="flex items-center gap-2">
        <GoalStarButton goal={goal} />
        <GoalMenu goal={goal} tasks={tasks} />
      </div>
    </div>
    <GoalReadyBanner goal={goal} tasks={tasks} />
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
      </p>
      <CreateTaskDialog key={goal.reference_xid} goalReferenceXid={goal.reference_xid} />
    </div>
  </header>
);
