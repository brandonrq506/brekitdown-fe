import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ThemeToggle } from "@/features/theme/components/ThemeToggle";

export const Route = createFileRoute("/_protected")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-svh">
      <header className="border-b">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex w-full max-w-5xl items-center gap-4 px-6 py-4"
        >
          <div className="flex gap-4">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="[&.active]:font-bold [&.active]:text-foreground"
            >
              Home
            </Link>
            <Link to="/goals" className="[&.active]:font-bold [&.active]:text-foreground">
              Goals
            </Link>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
