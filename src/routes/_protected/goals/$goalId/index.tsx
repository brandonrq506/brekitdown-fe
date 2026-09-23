import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";
import { goalDetailsPageQueryOptions } from "@/features/goals/api/queries";
import { GoalStarButton } from "@/features/goals/components/goal-star-button";
import { goalDetailsPageTasksQueryOptions } from "@/features/tasks/api/queries";
import { TaskCard } from "@/features/tasks/components/task-card";
import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import { orderGoalDetailsTasks } from "@/features/tasks/utils/order-goal-details-tasks";

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
      <header className="space-y-4 border-b pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-medium tracking-tight wrap-break-word">
              {data.data.name}
            </h1>
            {/* Won't be needed once we make description non-null */}
            {Boolean(data.data.description?.trim()) && (
              <p className="text-sm wrap-break-word whitespace-pre-wrap text-muted-foreground">
                {data.data.description}
              </p>
            )}
          </div>
          <GoalStarButton goal={data.data} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </p>
          <CreateTaskDialog key={goalId} goalReferenceXid={goalId} />
        </div>
      </header>
      <section
        aria-label="Tasks"
        className="flex flex-col gap-5 rounded-2xl bg-muted/30 p-4 sm:p-6">
        {tasks.map((task) => (
          <TaskCard key={task.reference_xid} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No tasks for this goal yet.</p>
        )}
      </section>
    </main>
  );
}
