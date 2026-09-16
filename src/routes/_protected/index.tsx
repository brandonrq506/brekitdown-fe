import { createFileRoute } from "@tanstack/react-router";
import { TaskCardReference } from "./-components/task-card-reference";

export const Route = createFileRoute("/_protected/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Home Page | Brekitdown",
      },
    ],
  }),
});

function RouteComponent() {
  return <TaskCardReference />;
}
