import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { goalQueries } from "@/features/goals/api/queries";

const goalsQueryOptions = goalQueries.list();

export const Route = createFileRoute("/__protected/goals/")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(goalsQueryOptions);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(goalsQueryOptions);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-10">
      <h1 className="text-4xl font-medium tracking-tight text-heading">Goals</h1>
      <p>
        {data.data.length} {data.data.length === 1 ? "goal" : "goals"} loaded
      </p>
    </main>
  );
}
