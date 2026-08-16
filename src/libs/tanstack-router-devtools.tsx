import type { TanStackDevtoolsReactPlugin } from "@tanstack/react-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

export const TanStackRouterDevtools: TanStackDevtoolsReactPlugin = {
  name: "Tanstack Router",
  render: <TanStackRouterDevtoolsPanel />,
};
