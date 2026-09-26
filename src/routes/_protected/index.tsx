import { createFileRoute } from "@tanstack/react-router";

import { RecommendationsPage } from "./-components/recommendations-page";
import { recommendationsPageQueryOptions } from "@/features/tasks/api/queries";

export const Route = createFileRoute("/_protected/")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.infiniteQuery({ ...recommendationsPageQueryOptions(), staleTime: "static" });
  },
  component: RecommendationsPage,
  head: () => ({
    meta: [
      {
        title: "Up next | Brekitdown",
      },
    ],
  }),
});
