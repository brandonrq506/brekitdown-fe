import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TaskDate } from "./task-date";
import { TaskDueDatePopover } from "./task-due-date-popover";

interface Props {
  disabled?: boolean;
  onChange: (dueAt: Date | null) => void;
  value: Date | null;
}

export const TaskDueDatePicker = ({ disabled = false, onChange, value }: Props) => (
  <div className="flex items-center gap-2">
    <TaskDueDatePopover
      disabled={disabled}
      onChange={onChange}
      value={value}
      trigger={<Button type="button" variant="outline" size="icon-sm" />}>
      <CalendarIcon />
      <span className="sr-only">{value === null ? "Set due date" : "Change due date"}</span>
    </TaskDueDatePopover>
    {value !== null && (
      <span className="text-sm text-muted-foreground">
        <TaskDate timestamp={value.toISOString()} />
      </span>
    )}
  </div>
);
