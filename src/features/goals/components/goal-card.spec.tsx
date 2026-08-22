import { GoalCard } from "./goal-card";
import type { Goal } from "../types/goal";
import { render, screen } from "@/test/test-utils";

const goal: Goal = {
  reference_xid: "goal_01",
  inserted_at: "2026-08-20T12:00:00Z",
  updated_at: "2026-08-21T12:00:00Z",
  name: "Learn shadcn/ui",
  description: "Build a small interface with components we own.",
};

it("shows the goal name and full description without exposing resource metadata", () => {
  render(<GoalCard goal={goal} />);

  expect(screen.getByRole("article", { name: goal.name })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: goal.name, level: 2 })).toBeInTheDocument();
  expect(screen.getByText(goal.description!)).toBeInTheDocument();
  expect(screen.queryByText(goal.reference_xid)).not.toBeInTheDocument();
  expect(screen.queryByText(goal.updated_at)).not.toBeInTheDocument();
});
