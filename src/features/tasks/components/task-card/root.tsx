import { useId, type ReactNode } from "react";

import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/utils/cn";
import type { Task } from "../../types/task";
import { TaskCardContext } from "./context";
import { NotesPanel } from "./notes";

interface RootProps {
  task: Task;
  children: ReactNode;
  className?: string;
}

export const Root = ({ task, children, className }: RootProps) => {
  const titleId = useId();

  return (
    // React 19: the context object is the provider.
    <TaskCardContext value={{ task, titleId }}>
      <Card
        role="article"
        aria-labelledby={titleId}
        className={cn("min-h-40 w-full min-w-0 gap-5 p-5 sm:p-6", className)}>
        {children}
      </Card>
    </TaskCardContext>
  );
};

/** Owns the grid that Status, Title and Actions place themselves into. */
export const Header = ({ children }: { children: ReactNode }) => (
  <CardHeader className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-3 px-0 sm:grid-cols-[1.5rem_minmax(0,1fr)_auto]">
    {children}
  </CardHeader>
);

/**
 * The header's trailing cell, so Timer and Menu share one grid cell instead of each taking one.
 * A plain div, not `CardAction`: `CardHeader` would switch to its own two-column grid for that.
 */
export const Actions = ({ children }: { children: ReactNode }) => (
  <div className="col-start-2 flex items-center gap-2 sm:col-start-3 sm:row-start-1">
    {children}
  </div>
);

/** Owns the Collapsible root and the `dl`, so Notes can put its trigger in the row and its panel below. */
export const Footer = ({ children }: { children: ReactNode }) => (
  <CardFooter className="mt-auto px-0 sm:ml-8">
    {/* The trigger belongs among the metadata below, while the panel it opens belongs under the
        whole row. Base UI allows them at different depths. */}
    <Collapsible className="w-full">
      <dl className="flex w-full min-w-0 flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
        {children}
      </dl>
      <CollapsibleContent className="pt-1">
        <NotesPanel />
      </CollapsibleContent>
    </Collapsible>
  </CardFooter>
);
