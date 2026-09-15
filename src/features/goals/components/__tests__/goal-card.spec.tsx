import { GoalCard } from "../goal-card";
import { goal, goalWithoutDescription } from "@/test/store/goals";
import { render, screen } from "@/test/test-utils";

it("shows the goal details", () => {
  render(<GoalCard goal={goal} />);

  expect(screen.getByRole("article", { name: goal.name })).toBeVisible();
  expect(screen.getByRole("heading", { name: goal.name, level: 2 })).toBeVisible();
  expect(screen.getByText(goal.description!)).toBeVisible();
});

it("shows a fallback for a goal without a description", () => {
  render(<GoalCard goal={goalWithoutDescription} />);

  expect(screen.getByText("No description yet.")).toBeVisible();
});
