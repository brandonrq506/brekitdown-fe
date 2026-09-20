import { useTaskNotes } from "../api/tanstack/use-task-notes";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { TaskDate } from "@/features/tasks/components/task-date";

interface Props {
  taskReferenceXid: string;
}

export const TaskNotesList = ({ taskReferenceXid }: Props) => {
  const { data, isPending, isError, isFetching, refetch } = useTaskNotes(taskReferenceXid);

  if (isPending) {
    return (
      <p role="status" className="py-8 text-muted-foreground">
        Loading notes…
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {isError && (
        <div role="alert" className="space-y-3">
          <p>
            {data === undefined
              ? "We couldn't load your notes."
              : "We couldn't refresh your notes. Showing the saved notes."}
          </p>
          <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
            {isFetching ? "Retrying…" : "Try again"}
          </Button>
        </div>
      )}
      {data?.data.length === 0 && (
        <p className="py-8 text-muted-foreground">No notes for this task yet.</p>
      )}
      {data !== undefined && data.data.length > 0 && (
        <Accordion
          multiple
          // The newest note is the one you almost always came back for, so it starts expanded.
          // A slice keeps this an empty array rather than an `undefined` when there are no notes.
          defaultValue={data.data.slice(0, 1).map((note) => note.reference_xid)}
          render={<ol aria-label="Task notes, newest first" />}>
          {data.data.map((note) => (
            <AccordionItem key={note.reference_xid} value={note.reference_xid} render={<li />}>
              <AccordionTrigger className="py-3">
                <span className="wrap-anywhere">{note.title}</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p className="leading-relaxed wrap-anywhere whitespace-pre-wrap">{note.body}</p>
                <p className="text-xs text-muted-foreground">
                  Created <TaskDate timestamp={note.inserted_at} />
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};
