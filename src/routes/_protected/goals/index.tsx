import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { goalQueries } from "@/features/goals/api/queries";
import { GoalsGrid } from "@/features/goals/components/goals-grid";

const goalsQueryOptions = goalQueries.list();

export const Route = createFileRoute("/_protected/goals/")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(goalsQueryOptions);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(goalsQueryOptions);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-medium tracking-tight text-foreground">Goals</h1>
        <p className="text-sm text-muted-foreground">
          {data.data.length} {data.data.length === 1 ? "goal" : "goals"}
        </p>
      </header>
      <GoalsGrid goals={data.data} />
    </main>
  );
}
