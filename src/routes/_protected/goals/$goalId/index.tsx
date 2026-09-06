import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";
import { goalQueries } from "@/features/goals/api/queries";
import { goalDetailsPageTasksQueryOptions } from "@/features/tasks/api/queries";

export const Route = createFileRoute("/_protected/goals/$goalId/")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params: { goalId } }) => {
    const [goal] = await Promise.all([
      queryClient.ensureQueryData(goalQueries.detail(goalId)),
      queryClient.ensureQueryData(goalDetailsPageTasksQueryOptions(goalId)),
    ]);

    return goal;
  },
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
  const { data: tasksData } = useSuspenseQuery(goalDetailsPageTasksQueryOptions(goalId));

  return (
    <div>
      You are looking at {data.data.name}
      <div>Tasks count: {tasksData.data.length}</div>
    </div>
  );
}
