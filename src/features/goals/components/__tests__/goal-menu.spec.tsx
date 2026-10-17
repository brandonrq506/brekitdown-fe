import userEvent from "@testing-library/user-event";
import { http } from "msw";

import { GoalMenu } from "../goal-menu";
import { apiRoutes } from "@/test/handlers/api-routes";
import { mockGoalResponse } from "@/test/handlers/goals";
import { server } from "@/test/server";
import { completedGoal, goal } from "@/test/store/goals";
import { render, screen, waitFor } from "@/test/test-utils";

/** Base UI only opens the menu from the keyboard in jsdom, so a click on the trigger is not enough. */
const openGoalActions = async (user: ReturnType<typeof userEvent.setup>) => {
  screen.getByRole("button", { name: `Goal actions for ${goal.name}` }).focus();
  await user.keyboard("{ArrowDown}");
};

it("offers Mark as completed for an open goal", async () => {
  const user = userEvent.setup();
  render(<GoalMenu goal={goal} />);

  await openGoalActions(user);

  expect(screen.getByRole("menuitem", { name: "Mark as completed" })).toBeVisible();
});

it("posts to the complete endpoint when Mark as completed is chosen", async () => {
  const user = userEvent.setup();
  const completed = vi.fn();
  server.use(
    http.post(apiRoutes.goalComplete(goal.reference_xid), () => {
      completed();

      return mockGoalResponse(completedGoal);
    }),
  );
  render(<GoalMenu goal={goal} />);

  await openGoalActions(user);
  await user.click(screen.getByRole("menuitem", { name: "Mark as completed" }));

  await waitFor(() => expect(completed).toHaveBeenCalledOnce());
});

it("renders no menu for a completed goal", () => {
  render(<GoalMenu goal={completedGoal} />);

  expect(screen.queryByRole("button", { name: /Goal actions/ })).not.toBeInTheDocument();
});
