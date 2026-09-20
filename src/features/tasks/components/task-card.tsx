import { useId } from "react";

import type { Task } from "../types/task";
import { TaskCardActions } from "./task-card-actions";
import { TaskCardDueDate } from "./task-card-due-date";
import { TaskCardStatus } from "./task-card-status";
import { TaskDate } from "./task-date";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { TaskNotesList } from "@/features/task-notes/components/task-notes-list";
import { TaskNotesTrigger } from "@/features/task-notes/components/task-notes-trigger";

interface Props {
  task: Task;
}

export const TaskCard = ({ task }: Props) => {
  const titleId = useId();
  const hasDescription = Boolean(task.description.trim());

  return (
    <Card
      role="article"
      aria-labelledby={titleId}
      className="min-h-40 w-full min-w-0 gap-5 p-5 sm:p-6">
      <CardHeader className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-3 px-0 sm:grid-cols-[1.5rem_minmax(0,1fr)_auto]">
        <TaskCardStatus task={task} />
        <CardTitle className="min-w-0">
          <h2 id={titleId} className="wrap-break-word">
            {task.name}
          </h2>
        </CardTitle>
        <TaskCardActions task={task} />
      </CardHeader>
      {hasDescription && (
        <CardContent className="px-0 sm:ml-8">
          <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-muted-foreground">
            {task.description}
          </p>
        </CardContent>
      )}
      <CardFooter className="mt-auto px-0 sm:ml-8">
        {/* The card owns this root: the trigger belongs among the metadata below, while the panel
            it opens belongs under the whole row. Base UI allows them at different depths. */}
        <Collapsible className="w-full">
          <dl className="flex w-full min-w-0 flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
            <div className="order-last flex flex-wrap gap-x-2 sm:ml-auto">
              <dt>Created</dt>
              <dd>
                <TaskDate timestamp={task.inserted_at} />
              </dd>
            </div>
            <div className="flex flex-wrap items-center gap-x-2">
              <TaskCardDueDate task={task} />
            </div>
            <div>
              <dt className="sr-only">Notes</dt>
              <dd>
                <TaskNotesTrigger task={task} />
              </dd>
            </div>
          </dl>
          <CollapsibleContent className="pt-1">
            <TaskNotesList taskReferenceXid={task.reference_xid} />
          </CollapsibleContent>
        </Collapsible>
      </CardFooter>
    </Card>
  );
};
