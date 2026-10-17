import userEvent from "@testing-library/user-event";
import { http } from "msw";

import { GoalMenu } from "../goal-menu";
import { goalsIndexPageQueryOptions } from "@/features/goals/api/queries";
import { apiRoutes } from "@/test/handlers/api-routes";
import { mockGoalResponse } from "@/test/handlers/goals";
import { server } from "@/test/server";
import { completedGoal, goal } from "@/test/store/goals";
import { openTasks } from "@/test/store/tasks";
import { render, screen, waitFor } from "@/test/test-utils";

/** Base UI only opens the menu from the keyboard in jsdom, so a click on the trigger is not enough. */
const openGoalActions = async (user: ReturnType<typeof userEvent.setup>) => {
  screen.getByRole("button", { name: `Goal actions for ${goal.name}` }).focus();
  await user.keyboard("{ArrowDown}");
};

it("offers Reopen instead of Mark as completed for a completed goal", async () => {
  const user = userEvent.setup();
  render(<GoalMenu goal={completedGoal} tasks={[]} />);

  await openGoalActions(user);

  expect(screen.getByRole("menuitem", { name: "Reopen" })).toBeVisible();
  expect(screen.queryByRole("menuitem", { name: "Mark as completed" })).not.toBeInTheDocument();
});

it("reopens a completed goal without a warning and refreshes the goal lists", async () => {
  const user = userEvent.setup();
  const reopened = vi.fn();
  server.use(
    http.post(apiRoutes.goalReopen(goal.reference_xid), () => {
      reopened();

      return mockGoalResponse(goal);
    }),
  );
  const { queryClient } = render(<GoalMenu goal={completedGoal} tasks={openTasks} />);
  const listQuery = goalsIndexPageQueryOptions();
  queryClient.setQueryData(listQuery.queryKey, { pages: [], pageParams: [] });

  await openGoalActions(user);
  await user.click(screen.getByRole("menuitem", { name: "Reopen" }));

  await waitFor(() => expect(reopened).toHaveBeenCalledOnce());
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await waitFor(() =>
    expect(queryClient.getQueryState(listQuery.queryKey)?.isInvalidated).toBe(true),
  );
});
