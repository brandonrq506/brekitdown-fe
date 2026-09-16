import { useId } from "react";
import { CalendarIcon, Clock3Icon, Link2Icon, MessageSquareIcon, TagIcon } from "lucide-react";

import { CompactEditor } from "./task-card-reference-compact-editor";
import { MetadataItem, ReferenceTaskActions, StatusControl } from "./task-card-reference-elements";
import type { TASK_STATUS } from "@/features/tasks/types/task";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  dependencies: string[];
  isRunning: boolean;
  setDependencies: (dependencies: string[]) => void;
  setStatus: (status: TASK_STATUS) => void;
  setTags: (tags: string[]) => void;
  status: TASK_STATUS;
  tags: string[];
  onAddChild: () => void;
  onToggleTimer: () => void;
};

export const ActiveTaskCardReference = ({
  dependencies,
  isRunning,
  setDependencies,
  setStatus,
  setTags,
  status,
  tags,
  onAddChild,
  onToggleTimer,
}: Props) => {
  const titleId = useId();

  return (
    <Card
      role="article"
      aria-labelledby={titleId}
      className="overflow-visible border border-primary/50 px-5 py-5 shadow-md ring-0 sm:px-6"
    >
      <CardHeader className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-3 px-0 sm:grid-cols-[1.5rem_minmax(0,1fr)_auto]">
        <StatusControl status={status} setStatus={setStatus} />
        <div className="min-w-0">
          <CardTitle>
            <h2 id={titleId} className="wrap-break-word">
              Draft Sendero case study
            </h2>
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Write project pages</p>
        </div>
        <ReferenceTaskActions
          primaryLabel={isRunning ? "Stop · 00:01" : "Start"}
          onAddChild={onAddChild}
          onPrimary={onToggleTimer}
        />
      </CardHeader>

      <CardContent className="px-0 sm:ml-9">
        <div className="flex gap-2 border-t pt-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="shrink-0 font-medium text-foreground">Latest note</strong>
          <span className="wrap-break-word">Lead with the problem, then explain the decision.</span>
        </div>
      </CardContent>

      <CardFooter className="overflow-visible px-0 sm:ml-9">
        <div className="flex w-full min-w-0 flex-wrap items-center gap-x-2 border-t pt-4">
          <MetadataItem
            icon={Clock3Icon}
            label="Time invested so far"
            value={isRunning ? "2h 16m" : "2h 15m"}
          />
          <MetadataItem icon={CalendarIcon} label="Due date" value="Today" />
          <CompactEditor
            icon={TagIcon}
            items={tags}
            label="Tags"
            placeholder="Add a tag…"
            setItems={setTags}
            summary={tags.length > 1 ? `${tags[0]} +${tags.length - 1}` : (tags[0] ?? "No tags")}
          />
          <CompactEditor
            icon={Link2Icon}
            items={dependencies}
            label="Dependencies"
            placeholder="Find a task…"
            setItems={setDependencies}
            summary={`${dependencies.length} ${dependencies.length === 1 ? "dependency" : "dependencies"}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs font-normal text-muted-foreground"
            title="Open notes"
          >
            <MessageSquareIcon aria-hidden="true" className="size-3.5" />3
          </Button>
          <span className="ml-auto h-8 content-center text-xs text-muted-foreground/70">
            Created Aug 24
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};
