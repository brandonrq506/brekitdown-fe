import { TaskDate } from "@/features/tasks/components/task-date";

type GoalCompletedAtProps = {
  completedAt: string | null;
};

/** "Completed <date>" for a Completed goal; nothing for an open one. */
export const GoalCompletedAt = ({ completedAt }: GoalCompletedAtProps) => {
  if (completedAt === null) return null;

  return (
    <p className="text-sm text-muted-foreground">
      Completed <TaskDate timestamp={completedAt} />
    </p>
  );
};
