import { MoreHorizontalIcon, PlusIcon, type LucideIcon } from "lucide-react";

import { TASK_STATUS_PRESENTATION } from "@/features/tasks/constants/task-status-presentation";
import type { TASK_STATUS } from "@/features/tasks/types/task";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const MetadataItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) => (
  <div className="flex h-8 items-center gap-1.5 text-xs text-muted-foreground" title={label}>
    <Icon aria-hidden="true" className="size-3.5" />
    <span>{value}</span>
  </div>
);

export const ReferenceTaskActions = ({
  primaryLabel,
  onAddChild,
  onPrimary,
}: {
  primaryLabel: string;
  onAddChild: () => void;
  onPrimary: () => void;
}) => (
  <div className="col-start-2 flex items-center gap-2 sm:col-start-3 sm:row-start-1">
    <Button
      type="button"
      className="min-w-20 rounded-lg"
      aria-label={primaryLabel.startsWith("Stop") ? "Stop" : "Start"}
      onClick={onPrimary}>
      {primaryLabel}
    </Button>
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Add child task"
      title="Add child task"
      onClick={onAddChild}>
      <PlusIcon aria-hidden="true" />
    </Button>
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="More task actions"
      title="More task actions">
      <MoreHorizontalIcon aria-hidden="true" />
    </Button>
  </div>
);

export const StatusControl = ({
  status,
  setStatus,
}: {
  status: TASK_STATUS;
  setStatus: (status: TASK_STATUS) => void;
}) => {
  const currentStatus = TASK_STATUS_PRESENTATION[status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="relative mt-0.5 size-6 shrink-0 rounded-full border-2 border-primary text-primary outline-none after:absolute after:inset-1.5 after:rounded-full after:bg-current focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label={`Status: ${currentStatus.label}`}
            title={currentStatus.label}
          />
        }
      />
      <DropdownMenuContent className="w-44">
        <DropdownMenuRadioGroup
          value={status}
          onValueChange={(value) => setStatus(value as TASK_STATUS)}>
          {Object.entries(TASK_STATUS_PRESENTATION).map(([value, presentation]) => {
            const StatusIcon = presentation.icon;

            return (
              <DropdownMenuRadioItem key={value} value={value} closeOnClick>
                <StatusIcon aria-hidden="true" />
                {presentation.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
