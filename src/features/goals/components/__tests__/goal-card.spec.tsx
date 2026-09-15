import { GoalCard } from "../goal-card";
import { goal } from "@/test/store/goals";
import { render, screen } from "@/test/test-utils";

it("shows the goal name and full description without exposing resource metadata", () => {
  render(<GoalCard goal={goal} />);

  expect(screen.getByRole("article", { name: goal.name })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: goal.name, level: 2 })).toBeInTheDocument();
  expect(screen.getByText(goal.description!)).toBeInTheDocument();
  expect(screen.queryByText(goal.reference_xid)).not.toBeInTheDocument();
  expect(screen.queryByText(goal.updated_at)).not.toBeInTheDocument();
});
