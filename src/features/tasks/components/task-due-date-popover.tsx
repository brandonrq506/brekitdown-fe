import { useState, type ComponentProps, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { endOfLocalDay } from "../utils/task-due-date";

interface Props {
  /** The trigger's contents, so each surface owns its own icon and labelling. */
  children: ReactNode;
  disabled?: boolean;
  onChange: (dueAt: Date | null) => void;
  /** The surface's own button, so its chrome never leaks into this shared behaviour. */
  trigger: NonNullable<ComponentProps<typeof PopoverTrigger>["render"]>;
  value: Date | null;
}

/**
 * Owns how a due day is chosen: a calendar in a popover, resolved to the end of that day in the
 * browser's timezone. Surfaces supply the trigger and decide how to present and persist the value.
 */
export const TaskDueDatePopover = ({
  children,
  disabled = false,
  onChange,
  trigger,
  value,
}: Props) => {
  const [open, setOpen] = useState(false);
  const selected = value ?? undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger disabled={disabled} render={trigger}>
        {children}
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
              }}>
              Remove
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
