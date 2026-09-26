import { Link } from "@tanstack/react-router";

import { CardContent, CardTitle } from "@/components/ui/card";
import { TaskDate } from "../task-date";
import { useTaskCard } from "./context";

export const Title = () => {
  const { task, titleId } = useTaskCard();

  return (
    <CardTitle className="min-w-0">
      <h2 id={titleId} className="wrap-break-word">
        {task.name}
      </h2>
    </CardTitle>
  );
};

export const Description = () => {
  const { task } = useTaskCard();
  if (!task.description.trim()) return null;

  return (
    <CardContent className="px-0 sm:ml-8">
      <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-muted-foreground">
        {task.description}
      </p>
    </CardContent>
  );
};

export const Created = () => {
  const { task } = useTaskCard();

  return (
    <div className="order-last flex flex-wrap gap-x-2 sm:ml-auto">
      <dt>Created</dt>
      <dd>
        <TaskDate timestamp={task.inserted_at} />
      </dd>
    </div>
  );
};

export const Goal = () => {
  const { task } = useTaskCard();
  if (task.goal === null) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-2">
      <dt className="sr-only">Goal</dt>
      <dd>
        <Link
          to="/goals/$goalId"
          params={{ goalId: task.goal.reference_xid }}
          className="rounded-sm wrap-anywhere hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          {task.goal.name}
        </Link>
      </dd>
    </div>
  );
};
