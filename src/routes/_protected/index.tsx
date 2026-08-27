import { createFileRoute } from "@tanstack/react-router";
import App from "@/App";

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
  return <App />;
}
