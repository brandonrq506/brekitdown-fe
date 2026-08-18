import { createFileRoute } from "@tanstack/react-router";
import App from "@/App";

export const Route = createFileRoute("/__protected/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <App />;
}
