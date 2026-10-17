import userEvent from "@testing-library/user-event";
import { http } from "msw";

import { GoalReadyBanner } from "../goal-ready-banner";
import { apiRoutes } from "@/test/handlers/api-routes";
import { mockGoalResponse } from "@/test/handlers/goals";
import { server } from "@/test/server";
import { completedGoal, goal } from "@/test/store/goals";
import { buildTask, closedTasks, openTasks } from "@/test/store/tasks";
import { render, screen, waitFor } from "@/test/test-utils";

const banner = () => screen.queryByRole("region", { name: "Goal ready to complete" });

it("shows when every task is closed and at least one is completed", () => {
  render(<GoalReadyBanner goal={goal} tasks={closedTasks} />);

  expect(banner()).toBeVisible();
  expect(banner()).toHaveTextContent("Every task is closed.");
});

it.each([
  ["a task is still open", goal, openTasks],
  ["every task is dropped", goal, [buildTask({ status: "dropped" })]],
  ["the goal has no tasks", goal, []],
  ["the goal is already completed", completedGoal, closedTasks],
] as const)("does not show when %s", (_, subject, tasks) => {
  render(<GoalReadyBanner goal={subject} tasks={tasks} />);

  expect(banner()).not.toBeInTheDocument();
});

it("completes the goal from its action", async () => {
  const user = userEvent.setup();
  const completed = vi.fn();
  server.use(
    http.post(apiRoutes.goalComplete(goal.reference_xid), () => {
      completed();

      return mockGoalResponse(completedGoal);
    }),
  );
  render(<GoalReadyBanner goal={goal} tasks={closedTasks} />);

  await user.click(screen.getByRole("button", { name: "Mark as completed" }));

  await waitFor(() => expect(completed).toHaveBeenCalledOnce());
});

it("appears right after the last open task is closed, without reloading", () => {
  const { rerender } = render(<GoalReadyBanner goal={goal} tasks={openTasks} />);
  expect(banner()).not.toBeInTheDocument();

  rerender(<GoalReadyBanner goal={goal} tasks={closedTasks} />);

  expect(banner()).toBeVisible();
});
