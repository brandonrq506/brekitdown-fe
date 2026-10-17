import { Suspense } from "react";
import userEvent from "@testing-library/user-event";
import { http } from "msw";

import { GoalsIndexPage } from "../goals-index-page";
import { apiRoutes } from "@/test/handlers/api-routes";
import { mockGoalsResponse } from "@/test/handlers/goals";
import { server } from "@/test/server";
import { buildGoal, goal } from "@/test/store/goals";
import { render, screen, waitFor } from "@/test/test-utils";

const completedFilter = "filters[0][field]=completed&filters[0][op]=%3D%3D&filters[0][value]=false";
const completedGoal = buildGoal({
  reference_xid: "goal_done",
  name: "Run a marathon",
  completed_at: "2026-09-20T12:00:00Z",
});
const laterGoal = buildGoal({ reference_xid: "goal_later", name: "Write the retro" });

/** Answers like the API: the `completed == false` filter drops Completed goals, order is kept. */
const serveGoals = () => {
  const queries: string[] = [];
  server.use(
    http.get(apiRoutes.goals, ({ request }) => {
      const query = decodeURIComponent(new URL(request.url).search);
      queries.push(query);
      const all = [goal, completedGoal, laterGoal];

      return mockGoalsResponse(query.includes("[field]=completed") ? [goal, laterGoal] : all);
    }),
  );

  return queries;
};

const renderPage = () =>
  render(
    <Suspense fallback={null}>
      <GoalsIndexPage />
    </Suspense>,
  );

const goalNames = () =>
  screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);

it("hides Completed goals by default", async () => {
  const queries = serveGoals();
  renderPage();

  expect(await screen.findByRole("button", { name: "Hide completed" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(queries[0]).toContain(decodeURIComponent(completedFilter));
  expect(screen.getAllByRole("article")).toHaveLength(2);
});

it("shows Completed goals in their usual position once the filter is removed", async () => {
  const user = userEvent.setup();
  const queries = serveGoals();
  renderPage();

  await user.click(await screen.findByRole("button", { name: "Hide completed" }));

  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(3));
  expect(queries.at(-1)).not.toContain("[field]=completed");
  expect(screen.getByRole("button", { name: "Hide completed" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  expect(goalNames()).toEqual([goal.name, completedGoal.name, laterGoal.name]);
});
