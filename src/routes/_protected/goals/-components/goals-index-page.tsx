import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { goalQueries } from "@/features/goals/api/queries";
import { CreateGoalDialog } from "@/features/goals/components/create-goal-dialog";
import { GoalsGrid } from "@/features/goals/components/goals-grid";

const goalsQueryOptions = goalQueries.list();

export function GoalsIndexPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } =
    useSuspenseInfiniteQuery(goalsQueryOptions);

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
        <CreateGoalDialog />
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
          onClick={() => void fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading…" : isFetchNextPageError ? "Try again" : "Load more"}
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
