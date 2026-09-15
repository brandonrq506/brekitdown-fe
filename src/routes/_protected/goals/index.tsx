import { createFileRoute } from "@tanstack/react-router";

import { GoalsIndexPage } from "./-components/goals-index-page";
import { goalsIndexPageQueryOptions } from "@/features/goals/api/queries";

export const Route = createFileRoute("/_protected/goals/")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.infiniteQuery({ ...goalsIndexPageQueryOptions(), staleTime: "static" });
  },
  component: GoalsIndexPage,
  head: () => ({
    meta: [
      {
        title: "Goals | Brekitdown",
      },
    ],
  }),
});
