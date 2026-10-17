import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";
import { goalDetailsPageQueryOptions } from "@/features/goals/api/queries";
import { goalDetailsPageTasksQueryOptions } from "@/features/tasks/api/queries";
import { TaskCard } from "@/features/tasks/components/task-card";
import { orderGoalDetailsTasks } from "@/features/tasks/utils/order-goal-details-tasks";
import { GoalDetailsHeader } from "./-components/goal-details-header";

export const Route = createFileRoute("/_protected/goals/$goalId/")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params: { goalId } }) => {
    const [goal] = await Promise.all([
      queryClient.query({ ...goalDetailsPageQueryOptions(goalId), staleTime: "static" }),
      queryClient.query({
        ...goalDetailsPageTasksQueryOptions(goalId),
        staleTime: "static",
      }),
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
  const { data } = useSuspenseQuery(goalDetailsPageQueryOptions(goalId));
  const { data: tasksData } = useSuspenseQuery(goalDetailsPageTasksQueryOptions(goalId));
  const tasks = orderGoalDetailsTasks(tasksData.data);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <GoalDetailsHeader goal={data.data} tasks={tasksData.data} />
      <section
        aria-label="Tasks"
        className="flex flex-col gap-5 rounded-2xl bg-muted/30 p-4 sm:p-6">
        {tasks.map((task) => (
          <TaskCard.Root key={task.reference_xid} task={task}>
            <TaskCard.Header>
              <TaskCard.Status />
              <TaskCard.Title />
              <TaskCard.Actions>
                <TaskCard.Timer />
                <TaskCard.Menu />
              </TaskCard.Actions>
            </TaskCard.Header>
            <TaskCard.Description />
            <TaskCard.Footer>
              <TaskCard.StatusDetails />
              <TaskCard.Notes />
            </TaskCard.Footer>
          </TaskCard.Root>
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No tasks for this goal yet.</p>
        )}
      </section>
    </main>
  );
}
