import { useState } from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { endOfLocalDay } from "../utils/task-due-date";
import { TaskDate } from "./task-date";

interface Props {
  disabled?: boolean;
  onChange: (dueAt: Date | null) => void;
  value: Date | null;
}

export const TaskDueDatePicker = ({ disabled = false, onChange, value }: Props) => {
  const [open, setOpen] = useState(false);
  const selected = value ?? undefined;

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          render={<Button type="button" variant="outline" size="icon-sm" />}
        >
          <CalendarIcon />
          <span className="sr-only">{value === null ? "Set due date" : "Change due date"}</span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto gap-0 p-0">
          <PopoverTitle className="sr-only">Choose a due date</PopoverTitle>
          <Calendar
            mode="single"
            autoFocus
            defaultMonth={selected}
            selected={selected}
            onSelect={(date) => {
              if (date === undefined) return;
              onChange(endOfLocalDay(date));
              setOpen(false);
            }}
          />
          {value !== null && (
            <div className="flex justify-end border-t px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Remove
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {value !== null && (
        <span className="text-sm text-muted-foreground">
          <TaskDate timestamp={value.toISOString()} />
        </span>
      )}
    </div>
  );
};
