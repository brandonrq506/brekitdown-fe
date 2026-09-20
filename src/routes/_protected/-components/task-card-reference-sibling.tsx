import { useId, useState } from "react";
import { CalendarIcon, Clock3Icon } from "lucide-react";

import { MetadataItem, ReferenceTaskActions, StatusControl } from "./task-card-reference-elements";
import type { TASK_STATUS } from "@/features/tasks/types/task";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const SiblingTaskCardReference = ({ onAddChild }: { onAddChild: () => void }) => {
  const titleId = useId();
  const [status, setStatus] = useState<TASK_STATUS>("scheduled");

  return (
    <Card
      role="article"
      aria-labelledby={titleId}
      className="overflow-visible px-5 py-5 ring-0 sm:ml-12 sm:w-[calc(100%-3rem)] sm:px-6">
      <CardHeader className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-3 px-0 sm:grid-cols-[1.5rem_minmax(0,1fr)_auto]">
        <StatusControl status={status} setStatus={setStatus} />
        <div className="min-w-0">
          <CardTitle>
            <h2 id={titleId} className="wrap-break-word">
              Add images and captions
            </h2>
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Write project pages</p>
        </div>
        <ReferenceTaskActions primaryLabel="Start" onAddChild={onAddChild} onPrimary={() => {}} />
      </CardHeader>
      <CardFooter className="px-0 sm:ml-9">
        <div className="flex w-full min-w-0 flex-wrap items-center gap-x-5 border-t pt-4">
          <MetadataItem icon={Clock3Icon} label="Time invested so far" value="0m" />
          <MetadataItem icon={CalendarIcon} label="Due date" value="Tomorrow" />
          <span className="ml-auto h-8 content-center text-xs text-muted-foreground/70">
            Created Aug 27
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};
