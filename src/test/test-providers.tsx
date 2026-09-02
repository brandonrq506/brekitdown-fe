import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterContextProvider } from "@tanstack/react-router";

import { routeTree } from "@/routeTree.gen";

interface Props {
  children: React.ReactNode;
}

export const createTestProviders = (initialEntries: string[] = ["/"]) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
    context: { queryClient },
    defaultPreload: false,
  });

  const TestProviders = ({ children }: Props) => (
    <QueryClientProvider client={queryClient}>
      <RouterContextProvider router={router}>{children}</RouterContextProvider>
    </QueryClientProvider>
  );

  return { queryClient, router, TestProviders };
};
