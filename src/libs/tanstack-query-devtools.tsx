import type { TanStackDevtoolsReactPlugin } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";

export const TanStackQueryDevtools: TanStackDevtoolsReactPlugin = {
  name: "Tanstack Query",
  render: <ReactQueryDevtoolsPanel />,
};
