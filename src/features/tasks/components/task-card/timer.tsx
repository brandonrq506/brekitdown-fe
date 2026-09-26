import { TaskCardStartBtn } from "@/features/time-entries/components/task-card-start-btn";
import { TaskCardStopBtn } from "@/features/time-entries/components/task-card-stop-btn";
import { TASK_STATUS, type Task } from "../../types/task";
import { useTaskCard } from "./context";

type TimerAction = { type: "start" } | { type: "stop"; entryReferenceXid: string };

const getTimerAction = (task: Task): TimerAction | null => {
  if (task.status === TASK_STATUS.COMPLETED || task.has_children) return null;

  const runningTimeEntry = task.time_entries.find((entry) => entry.ended_at === null);
  if (runningTimeEntry === undefined) return { type: "start" };

  return { type: "stop", entryReferenceXid: runningTimeEntry.reference_xid };
};

/** Start or Stop, depending on whether a time entry is running. Expects Actions as its parent. */
export const Timer = () => {
  const { task } = useTaskCard();
  const timerAction = getTimerAction(task);

  if (timerAction?.type === "stop") {
    return <TaskCardStopBtn task={task} entryReferenceXid={timerAction.entryReferenceXid} />;
  }
  if (timerAction?.type === "start") return <TaskCardStartBtn task={task} />;

  return null;
};
