import { useId } from "react";
import { CalendarIcon } from "lucide-react";

import { TASK_STATUS_PRESENTATION } from "../constants/task-status-presentation";
import type { Task } from "../types/task";
import { TaskCardActions } from "./task-card-actions";
import { TaskDate } from "./task-date";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  task: Task;
}

export const TaskCard = ({ task }: Props) => {
  const titleId = useId();
  const hasDescription = Boolean(task.description.trim());
  const { label, icon: StatusIcon } = TASK_STATUS_PRESENTATION[task.status];

  return (
    <Card
      role="article"
      aria-labelledby={titleId}
      className="min-h-40 w-full min-w-0 gap-5 p-5 sm:p-6"
    >
      <CardHeader className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-3 px-0 sm:grid-cols-[1.5rem_minmax(0,1fr)_auto]">
        <span
          role="img"
          aria-label={label}
          title={label}
          className="mt-0.5 shrink-0 text-muted-foreground"
        >
          <StatusIcon aria-hidden="true" className="size-5" />
        </span>
        <CardTitle className="min-w-0">
          <h2 id={titleId} className="wrap-break-word">
            {task.name}
          </h2>
        </CardTitle>
        <TaskCardActions task={task} />
      </CardHeader>
      {hasDescription && (
        <CardContent className="px-0 sm:ml-8">
          <p className="text-sm leading-relaxed wrap-break-word text-muted-foreground">
            {task.description}
          </p>
        </CardContent>
      )}
      <CardFooter className="mt-auto px-0 sm:ml-8">
        <dl className="flex w-full min-w-0 flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
          <div className="order-last flex flex-wrap gap-x-2 sm:ml-auto">
            <dt>Created</dt>
            <dd>
              <TaskDate timestamp={task.inserted_at} />
            </dd>
          </div>
          <div className="flex flex-wrap items-center gap-x-2">
            <dt className="flex items-center" title="Due date">
              <CalendarIcon aria-hidden="true" className="size-3.5" />
              <span className="sr-only">Due</span>
            </dt>
            <dd>{task.due_at === null ? "No due date" : <TaskDate timestamp={task.due_at} />}</dd>
          </div>
        </dl>
      </CardFooter>
    </Card>
  );
};
