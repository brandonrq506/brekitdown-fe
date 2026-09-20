import { useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon, MessageSquareIcon } from "lucide-react";

import { taskNoteQueries } from "../api/queries";
import { Button } from "@/components/ui/button";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Task } from "@/features/tasks/types/task";

interface Props {
  task: Pick<Task, "reference_xid" | "name" | "notes_count">;
}

/**
 * Expects a `Collapsible` ancestor: the card owns that root because this button belongs in the
 * footer's metadata row while the panel it opens belongs below the whole row.
 */
export const TaskNotesTrigger = ({ task }: Props) => {
  const queryClient = useQueryClient();
  const prefetchNotes = () => {
    // Prefetch failures stay in the cache; expanding the notes can retry and display an error.
    void queryClient.query(taskNoteQueries.list(task.reference_xid)).catch(() => {});
  };

  return (
    <CollapsibleTrigger
      render={
        <Button
          variant="ghost"
          size="sm"
          className="group/notes-trigger h-11 gap-2 px-2 text-xs sm:h-8"
        />
      }
      aria-label={`Notes for ${task.name} (${task.notes_count})`}
      onMouseEnter={prefetchNotes}
      onFocus={prefetchNotes}>
      <MessageSquareIcon aria-hidden="true" className="size-3.5" />
      <span>Notes</span>
      <span>{task.notes_count}</span>
      <ChevronDownIcon
        aria-hidden="true"
        className="size-3.5 transition-transform duration-150 group-data-panel-open/notes-trigger:rotate-180 motion-reduce:transition-none"
      />
    </CollapsibleTrigger>
  );
};
