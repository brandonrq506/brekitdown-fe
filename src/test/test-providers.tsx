import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterContextProvider } from "@tanstack/react-router";

import { routeTree } from "@/routeTree.gen";

interface Props {
  children: React.ReactNode;
}

export const TestProviders = ({ children }: Props) => {
  // TODO: Verify if the lib/tanstack-query #createQueryClient is a better approach.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
    context: { queryClient },
    defaultPreload: false,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <RouterContextProvider router={router}>{children}</RouterContextProvider>
    </QueryClientProvider>
  );
};
