import userEvent from "@testing-library/user-event";
import { http } from "msw";

import { GoalStarButton } from "../goal-star-button";
import { apiRoutes } from "@/test/handlers/api-routes";
import { mockGoalResponse } from "@/test/handlers/goals";
import { server } from "@/test/server";
import { goal, starredGoal } from "@/test/store/goals";
import { render, screen } from "@/test/test-utils";

import type { GoalResponse, UpdateGoalPayload } from "../../types/goal";

it("offers Star for an unstarred goal", () => {
  render(<GoalStarButton goal={goal} />);

  expect(screen.getByRole("button", { name: `Star ${goal.name}`, pressed: false })).toBeVisible();
});

it("offers pressed Unstar for a starred goal", () => {
  render(<GoalStarButton goal={starredGoal} />);

  expect(
    screen.getByRole("button", { name: `Unstar ${starredGoal.name}`, pressed: true }),
  ).toBeVisible();
});

it("shows the goal as starred after starring it", async () => {
  const user = userEvent.setup();
  server.use(
    http.patch<never, UpdateGoalPayload, GoalResponse>(
      apiRoutes.goal(goal.reference_xid),
      async ({ request }) => {
        const body = await request.json();

        return mockGoalResponse({ ...goal, ...body.goal });
      },
    ),
  );
  render(<GoalStarButton goal={goal} />);

  await user.click(screen.getByRole("button", { name: `Star ${goal.name}` }));

  expect(
    await screen.findByRole("button", { name: `Unstar ${goal.name}`, pressed: true }),
  ).toBeVisible();
});

it("shows the goal as unstarred after unstarring it", async () => {
  const user = userEvent.setup();
  server.use(
    http.patch<never, UpdateGoalPayload, GoalResponse>(
      apiRoutes.goal(starredGoal.reference_xid),
      async ({ request }) => {
        const body = await request.json();

        return mockGoalResponse({ ...starredGoal, ...body.goal });
      },
    ),
  );
  render(<GoalStarButton goal={starredGoal} />);

  await user.click(screen.getByRole("button", { name: `Unstar ${starredGoal.name}` }));

  expect(
    await screen.findByRole("button", { name: `Star ${starredGoal.name}`, pressed: false }),
  ).toBeVisible();
});
