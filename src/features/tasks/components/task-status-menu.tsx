import type { ComponentProps, ReactNode } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TASK_STATUS_PRESENTATION } from "../constants/task-status-presentation";
import type { TASK_STATUS } from "../types/task";
import { isTaskStatus } from "../utils/task-status";

interface Props {
  /** The trigger's contents, so each surface owns its own icon and labelling. */
  children: ReactNode;
  disabled?: boolean;
  /** Called only with a status different from `value`. */
  onValueChange: (status: TASK_STATUS) => void;
  /** The surface's own button, so its chrome never leaks into this shared behaviour. */
  trigger: NonNullable<ComponentProps<typeof DropdownMenuTrigger>["render"]>;
  value: TASK_STATUS;
}

/** Owns how a status is chosen. Surfaces supply the trigger and decide how to present and persist it. */
export const TaskStatusMenu = ({
  children,
  disabled = false,
  onValueChange,
  trigger,
  value,
}: Props) => {
  // Base UI types the incoming value as `any`; narrow instead of asserting.
  const handleValueChange = (next: unknown) => {
    if (!isTaskStatus(next) || next === value) return;

    onValueChange(next);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={disabled} render={trigger}>
        {children}
      </DropdownMenuTrigger>
      {/* The popup would otherwise take the trigger's width, which is one icon wide. */}
      <DropdownMenuContent className="w-44">
        <DropdownMenuRadioGroup value={value} onValueChange={handleValueChange}>
          {Object.entries(TASK_STATUS_PRESENTATION).map(([status, { icon: ItemIcon, label }]) => (
            <DropdownMenuRadioItem key={status} value={status} closeOnClick>
              <ItemIcon aria-hidden="true" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
