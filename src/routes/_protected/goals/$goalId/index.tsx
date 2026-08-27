import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";
import { goalQueries } from "@/features/goals/api/queries";

export const Route = createFileRoute("/_protected/goals/$goalId/")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params: { goalId } }) =>
    queryClient.ensureQueryData(goalQueries.detail(goalId)),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.data.name} | Brekitdown`,
      },
    ],
  }),
});

function RouteComponent() {
  const { goalId } = Route.useParams();
  const { data } = useSuspenseQuery(goalQueries.detail(goalId));

  return <div>You are looking at {data.data.name}</div>;
}
