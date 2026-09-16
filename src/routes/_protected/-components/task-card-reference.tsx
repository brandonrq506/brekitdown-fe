import { useState } from "react";

import { ActiveTaskCardReference } from "./task-card-reference-active";
import { SiblingTaskCardReference } from "./task-card-reference-sibling";
import type { TASK_STATUS } from "@/features/tasks/types/task";

/**
 * Standalone visual reference for the task-card direction discussed during design.
 * It deliberately owns only local demo state and is not wired to task or time-entry APIs.
 */
export const TaskCardReference = () => {
  const [status, setStatus] = useState<TASK_STATUS>("in_progress");
  const [isRunning, setIsRunning] = useState(false);
  const [tags, setTags] = useState(["Writing", "Deep work"]);
  const [dependencies, setDependencies] = useState(["Choose screenshots", "Approve story outline"]);
  const [announcement, setAnnouncement] = useState("");

  const toggleTimer = () => {
    setIsRunning((running) => !running);
    setStatus("in_progress");
  };

  const announceAddChild = () => {
    setAnnouncement("Add child opens a focused task composer for this parent.");
  };

  return (
    <section aria-label="Task card reference" className="rounded-2xl bg-muted/30 p-4 sm:p-7">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <ActiveTaskCardReference
          dependencies={dependencies}
          isRunning={isRunning}
          setDependencies={setDependencies}
          setStatus={setStatus}
          setTags={setTags}
          status={status}
          tags={tags}
          onAddChild={announceAddChild}
          onToggleTimer={toggleTimer}
        />
        <SiblingTaskCardReference onAddChild={announceAddChild} />
        <p aria-live="polite" className="min-h-5 text-center text-xs text-muted-foreground">
          {announcement}
        </p>
      </div>
    </section>
  );
};
