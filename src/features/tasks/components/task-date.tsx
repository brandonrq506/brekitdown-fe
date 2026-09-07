import { formatExactTaskDate, formatTaskDate } from "../utils/format-task-date";

interface TaskDateProps {
  timestamp: string;
}

/** Keeps the machine-readable instant, the short label and the exact date travelling together. */
export const TaskDate = ({ timestamp }: TaskDateProps) => (
  <time dateTime={timestamp} title={formatExactTaskDate(timestamp)}>
    {formatTaskDate(timestamp)}
  </time>
);
