import { createFileRoute } from "@tanstack/react-router";

import { GoalsIndexPage } from "./-components/goals-index-page";
import { goalQueries } from "@/features/goals/api/queries";

export const Route = createFileRoute("/_protected/goals/")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureInfiniteQueryData(goalQueries.list());
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
