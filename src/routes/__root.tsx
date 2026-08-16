import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackDevtoolsWrapper } from "@/libs/tanstack-devtools";
import { Fragment } from "react/jsx-runtime";
import type { QueryClient } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <Fragment>
      <Outlet />
      <TanStackDevtoolsWrapper />
    </Fragment>
  ),
});
