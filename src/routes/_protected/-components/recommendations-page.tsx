import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { recommendationsPageQueryOptions } from "@/features/tasks/api/queries";
import { TaskCard } from "@/features/tasks/components/task-card";

const recommendationsQueryOptions = recommendationsPageQueryOptions();

function getLoadMoreLabel(isFetchingNextPage: boolean, isFetchNextPageError: boolean) {
  if (isFetchingNextPage) return "Loading…";
  if (isFetchNextPageError) return "Try again";

  return "Load more";
}

export function RecommendationsPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } =
    useSuspenseInfiniteQuery(recommendationsQueryOptions);

  const tasks = data.pages.flatMap((page) => page.data);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="space-y-2 border-b pb-6">
        <h1 className="text-4xl font-medium tracking-tight text-foreground">Up next</h1>
        <p className="text-sm text-muted-foreground">
          Scheduled and in-progress tasks, soonest due first.
        </p>
      </header>
      <section
        aria-label="Recommended tasks"
        className="flex flex-col gap-5 rounded-2xl bg-muted/30 p-4 sm:p-6">
        {tasks.map((task) => (
          <TaskCard.Root key={task.reference_xid} task={task}>
            <TaskCard.Header>
              <TaskCard.Status />
              <TaskCard.Title />
              <TaskCard.Actions>
                <TaskCard.Timer />
              </TaskCard.Actions>
            </TaskCard.Header>
            <TaskCard.Footer>
              <TaskCard.Goal />
              <TaskCard.DueDate />
            </TaskCard.Footer>
          </TaskCard.Root>
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nothing due. Schedule a task with a due date.
          </p>
        )}
      </section>
      {isFetchNextPageError && (
        <p role="alert" className="text-center text-sm text-destructive">
          We couldn&apos;t load more tasks. Please try again.
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
    </main>
  );
}
