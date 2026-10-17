import { startTransition, useState } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { ListFilterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { goalsIndexPageQueryOptions } from "@/features/goals/api/queries";
import { CreateGoalDialog } from "@/features/goals/components/create-goal-dialog";
import { GoalsGrid } from "@/features/goals/components/goals-grid";

function getLoadMoreLabel(isFetchingNextPage: boolean, isFetchNextPageError: boolean) {
  if (isFetchingNextPage) return "Loading…";
  if (isFetchNextPageError) return "Try again";

  return "Load more";
}

export function GoalsIndexPage() {
  const [includeCompleted, setIncludeCompleted] = useState(false);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } =
    useSuspenseInfiniteQuery(goalsIndexPageQueryOptions({ includeCompleted }));

  // A transition keeps the current list on screen while the other filter's first page loads,
  // instead of suspending the whole page.
  const toggleCompleted = () => startTransition(() => setIncludeCompleted((value) => !value));

  const goals = data.pages.flatMap((page) => page.data);
  const totalCount = data.pages[0]?.meta.total_count ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-medium tracking-tight text-foreground">Goals</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? "goal" : "goals"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="aria-pressed:bg-muted aria-pressed:text-foreground"
            aria-pressed={!includeCompleted}
            onClick={toggleCompleted}>
            <ListFilterIcon data-icon="inline-start" />
            Hide completed
          </Button>
          <CreateGoalDialog />
        </div>
      </header>
      <GoalsGrid goals={goals} />
      {isFetchNextPageError && (
        <p role="alert" className="text-center text-sm text-destructive">
          We couldn&apos;t load more goals. Please try again.
        </p>
      )}
      {hasNextPage && (
        <Button
          className="self-center"
          variant="outline"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}>
          {getLoadMoreLabel(isFetchingNextPage, isFetchNextPageError)}
        </Button>
      )}
      {!hasNextPage && goals.length > 0 && (
        <p role="status" className="text-center text-sm text-muted-foreground">
          All goals loaded
        </p>
      )}
    </main>
  );
}
