import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackRouterDevtools } from "./tanstack-router";

export const TanStackDevtoolsWrapper = () => {
  if (!import.meta.env.DEV) return null;

  return <TanStackDevtools plugins={[TanStackRouterDevtools]} />;
};
