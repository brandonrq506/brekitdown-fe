import userEvent from "@testing-library/user-event";
import { http } from "msw";

import { GoalMenu } from "../goal-menu";
import { apiRoutes } from "@/test/handlers/api-routes";
import { mockGoalResponse } from "@/test/handlers/goals";
import { server } from "@/test/server";
import { goalDetailsPageTasksQueryOptions } from "@/features/tasks/api/queries";
import { completedGoal, goal } from "@/test/store/goals";
import { closedTasks, openTasks } from "@/test/store/tasks";
import { render, screen, waitFor, within } from "@/test/test-utils";

/** Base UI only opens the menu from the keyboard in jsdom, so a click on the trigger is not enough. */
const openGoalActions = async (user: ReturnType<typeof userEvent.setup>) => {
  screen.getByRole("button", { name: `Goal actions for ${goal.name}` }).focus();
  await user.keyboard("{ArrowDown}");
};

const trackCompleteRequests = () => {
  const completed = vi.fn();
  server.use(
    http.post(apiRoutes.goalComplete(goal.reference_xid), () => {
      completed();

      return mockGoalResponse(completedGoal);
    }),
  );

  return completed;
};

it("offers Mark as completed for an open goal", async () => {
  const user = userEvent.setup();
  render(<GoalMenu goal={goal} tasks={[]} />);

  await openGoalActions(user);

  expect(screen.getByRole("menuitem", { name: "Mark as completed" })).toBeVisible();
});

it("completes without a warning when the goal has no open tasks", async () => {
  const user = userEvent.setup();
  const completed = trackCompleteRequests();
  render(<GoalMenu goal={goal} tasks={closedTasks} />);

  await openGoalActions(user);
  await user.click(screen.getByRole("menuitem", { name: "Mark as completed" }));

  await waitFor(() => expect(completed).toHaveBeenCalledOnce());
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("warns with a count per open status before completing a goal with open tasks", async () => {
  const user = userEvent.setup();
  const completed = trackCompleteRequests();
  render(<GoalMenu goal={goal} tasks={openTasks} />);

  await openGoalActions(user);
  await user.click(screen.getByRole("menuitem", { name: "Mark as completed" }));

  const dialog = await screen.findByRole("dialog", { name: "Complete goal with open tasks?" });
  expect(dialog).toHaveTextContent("Completing it will switch them to Dropped.");
  const counts = within(dialog)
    .getAllByRole("listitem")
    .map((item) => item.textContent);
  expect(counts).toEqual(["2 Scheduled", "1 On hold"]);
  expect(completed).not.toHaveBeenCalled();
});

it("completes the goal and refreshes its tasks once the warning is confirmed", async () => {
  const user = userEvent.setup();
  const completed = trackCompleteRequests();
  const { queryClient } = render(<GoalMenu goal={goal} tasks={openTasks} />);
  const tasksQuery = goalDetailsPageTasksQueryOptions(goal.reference_xid);
  queryClient.setQueryData(tasksQuery.queryKey, { data: openTasks });

  await openGoalActions(user);
  await user.click(screen.getByRole("menuitem", { name: "Mark as completed" }));
  await user.click(await screen.findByRole("button", { name: "Complete and drop tasks" }));

  await waitFor(() => expect(completed).toHaveBeenCalledOnce());
  await waitFor(() =>
    expect(queryClient.getQueryState(tasksQuery.queryKey)?.isInvalidated).toBe(true),
  );
});

it("does not complete the goal when the warning is cancelled", async () => {
  const user = userEvent.setup();
  const completed = trackCompleteRequests();
  render(<GoalMenu goal={goal} tasks={openTasks} />);

  await openGoalActions(user);
  await user.click(screen.getByRole("menuitem", { name: "Mark as completed" }));
  await user.click(await screen.findByRole("button", { name: "Cancel" }));

  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(completed).not.toHaveBeenCalled();
});
