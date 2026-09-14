import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { GoalStarButton } from "../goal-star-button";
import type { Goal } from "../../types/goal";
import { api, GOALS_ENDPOINT } from "@/libs/axios";
import { server } from "@/test/server";
import { render, screen } from "@/test/test-utils";

const GOALS_URL = `${api.defaults.baseURL}${GOALS_ENDPOINT}`;

const goal: Goal = {
  reference_xid: "goal_01",
  inserted_at: "2026-08-20T12:00:00Z",
  updated_at: "2026-08-21T12:00:00Z",
  name: "Learn shadcn/ui",
  description: "Build a small interface with components we own.",
  archived_at: null,
  starred_at: null,
};

it("offers Star for an unstarred goal", () => {
  render(<GoalStarButton goal={goal} />);

  expect(screen.getByRole("button", { name: `Star ${goal.name}`, pressed: false })).toBeVisible();
});

it("offers pressed Unstar for a starred goal", () => {
  const starredGoal = { ...goal, starred_at: "2026-09-13T12:00:00Z" };

  render(<GoalStarButton goal={starredGoal} />);

  expect(screen.getByRole("button", { name: `Unstar ${goal.name}`, pressed: true })).toBeVisible();
});

it("shows the goal as starred after starring it", async () => {
  const user = userEvent.setup();
  const starredGoal = { ...goal, starred_at: "2026-09-13T12:00:00Z" };
  server.use(
    http.patch(`${GOALS_URL}/${goal.reference_xid}`, () =>
      HttpResponse.json({ data: starredGoal }),
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
  const starredGoal = { ...goal, starred_at: "2026-09-13T12:00:00Z" };
  server.use(
    http.patch(`${GOALS_URL}/${goal.reference_xid}`, () => HttpResponse.json({ data: goal })),
  );
  render(<GoalStarButton goal={starredGoal} />);

  await user.click(screen.getByRole("button", { name: `Unstar ${goal.name}` }));

  expect(
    await screen.findByRole("button", { name: `Star ${goal.name}`, pressed: false }),
  ).toBeVisible();
});
