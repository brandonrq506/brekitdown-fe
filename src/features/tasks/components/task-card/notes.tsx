import { TaskNotesList } from "@/features/task-notes/components/task-notes-list";
import { TaskNotesTrigger } from "@/features/task-notes/components/task-notes-trigger";
import { useTaskCard } from "./context";

/** The notes toggle. Expects the Footer's `dl` as its parent; the Footer renders the panel it opens. */
export const Notes = () => {
  const { task } = useTaskCard();

  return (
    <div>
      <dt className="sr-only">Notes</dt>
      <dd>
        <TaskNotesTrigger task={task} />
      </dd>
    </div>
  );
};

export const NotesPanel = () => {
  const { task } = useTaskCard();

  return <TaskNotesList taskReferenceXid={task.reference_xid} />;
};
