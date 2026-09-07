import {
  CircleIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CirclePauseIcon,
  CircleXIcon,
  type LucideIcon,
} from "lucide-react";

import type { TASK_STATUS } from "../types/task";

interface TaskStatusPresentation {
  label: string;
  icon: LucideIcon;
}

export const TASK_STATUS_PRESENTATION = {
  scheduled: { label: "Scheduled", icon: CircleIcon },
  in_progress: { label: "In progress", icon: CircleDashedIcon },
  completed: { label: "Completed", icon: CircleCheckIcon },
  dropped: { label: "Dropped", icon: CircleXIcon },
  on_hold: { label: "On hold", icon: CirclePauseIcon },
} satisfies Record<TASK_STATUS, TaskStatusPresentation>;
