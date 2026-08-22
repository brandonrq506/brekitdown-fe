import { GoalsGrid } from "./goals-grid";
import type { Goal } from "../types/goal";
import { render, screen } from "@/test/test-utils";

const goals: Goal[] = [
  {
    reference_xid: "goal_01",
    inserted_at: "2026-08-20T12:00:00Z",
    updated_at: "2026-08-21T12:00:00Z",
    name: "Learn shadcn/ui",
    description: "Build a small interface.",
  },
  {
    reference_xid: "goal_02",
    inserted_at: "2026-08-20T13:00:00Z",
    updated_at: "2026-08-21T13:00:00Z",
    name: "Ship a feature",
    description: null,
  },
];

it("renders every goal as a card", () => {
  render(<GoalsGrid goals={goals} />);

  expect(screen.getByRole("region", { name: "Goals" })).toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(2);
  expect(screen.getByRole("heading", { name: "Learn shadcn/ui" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Ship a feature" })).toBeInTheDocument();
});

it("renders an informative empty state", () => {
  render(<GoalsGrid goals={[]} />);

  expect(screen.getByRole("region", { name: "Goals" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "No goals yet", level: 2 })).toBeInTheDocument();
  expect(screen.getByText("Goals you create will show up here.")).toBeInTheDocument();
});
