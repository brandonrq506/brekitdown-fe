import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";
import { goalQueries } from "@/features/goals/api/queries";
import { goalDetailsPageTasksQueryOptions } from "@/features/tasks/api/queries";
import { TaskCard } from "@/features/tasks/components/task-card";

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
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="space-y-2 border-b pb-6">
        <h1 className="text-4xl font-medium tracking-tight wrap-break-word">{data.data.name}</h1>
        {/* Won't be needed once we make description non-null */}
        {Boolean(data.data.description?.trim()) && (
          <p className="text-sm wrap-break-word text-muted-foreground">{data.data.description}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {tasksData.data.length} {tasksData.data.length === 1 ? "task" : "tasks"}
        </p>
      </header>
      <section
        aria-label="Tasks"
        className="flex flex-col gap-5 rounded-2xl bg-muted/30 p-4 sm:p-6"
      >
        {tasksData.data.map((task) => (
          <TaskCard key={task.reference_xid} task={task} />
        ))}
        {tasksData.data.length === 0 && (
          <p className="text-sm text-muted-foreground">No tasks for this goal yet.</p>
        )}
      </section>
    </main>
  );
}
