import { TanStackDevtoolsWrapper } from "@/libs/tanstack-devtools";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/__protected")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-svh">
      <header className="border-b">
        <nav aria-label="Main navigation" className="mx-auto flex w-full max-w-5xl gap-4 px-6 py-4">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="[&.active]:font-bold [&.active]:text-heading"
          >
            Home
          </Link>
          <Link to="/goals" className="[&.active]:font-bold [&.active]:text-heading">
            Goals
          </Link>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
