import { TASK_STATUS, type Task } from "../types/task";
import { TaskCardStartBtn } from "@/routes/_protected/goals/-components/task-card-start-btn";
import { TaskCardStopBtn } from "@/routes/_protected/goals/-components/task-card-stop-btn";

type TaskActionContext = Pick<Task, "has_children" | "reference_xid" | "status" | "time_entries">;

type Action = {
  taskReferenceXid: string;
} & (
  | {
      type: "start";
      entryReferenceXid?: never;
    }
  | {
      type: "stop";
      entryReferenceXid: string;
    }
);

interface Props {
  task: TaskActionContext;
}

const getAction = (task: TaskActionContext): Action | null => {
  if (task.status === TASK_STATUS.COMPLETED || task.has_children) return null;

  const runningTimeEntry = task.time_entries.find((entry) => entry.ended_at === null);
  if (runningTimeEntry === undefined) {
    return { type: "start", taskReferenceXid: task.reference_xid };
  }

  return {
    type: "stop",
    taskReferenceXid: task.reference_xid,
    entryReferenceXid: runningTimeEntry.reference_xid,
  };
};

export const TaskCardCompletedActionsMenu = ({ task }: Props) => {
  const action = getAction(task);
  if (action === null) return null;

  return (
    <div className="col-start-2 flex items-center gap-2 sm:col-start-3 sm:row-start-1">
      {action.type === "stop" ? (
        <TaskCardStopBtn
          taskReferenceXid={action.taskReferenceXid}
          entryReferenceXid={action.entryReferenceXid}
        />
      ) : (
        <TaskCardStartBtn taskReferenceXid={action.taskReferenceXid} />
      )}
    </div>
  );
};
