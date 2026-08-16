import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackDevtoolsWrapper } from "@/libs/tanstack-devtools";
import { Fragment } from "react/jsx-runtime";

export const Route = createRootRoute({
  component: () => (
    <Fragment>
      <Outlet />
      <TanStackDevtoolsWrapper />
    </Fragment>
  ),
});
