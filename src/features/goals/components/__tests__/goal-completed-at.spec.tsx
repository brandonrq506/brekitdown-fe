import { GoalCompletedAt } from "../goal-completed-at";
import { completedGoal } from "@/test/store/goals";
import { render, screen } from "@/test/test-utils";

it("shows when a completed goal was completed", () => {
  render(<GoalCompletedAt completedAt={completedGoal.completed_at} />);

  expect(screen.getByText(/^Completed/)).toBeVisible();
  expect(screen.getByText(/^Completed/).querySelector("time")).toHaveAttribute(
    "datetime",
    completedGoal.completed_at,
  );
});

it("shows nothing for an open goal", () => {
  render(<GoalCompletedAt completedAt={null} />);

  expect(screen.queryByText(/Completed/)).not.toBeInTheDocument();
});
