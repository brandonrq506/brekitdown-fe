import { GoalsGrid } from "../goals-grid";
import { goals } from "@/test/store/goals";
import { render, screen } from "@/test/test-utils";

it("renders every goal as a card", () => {
  render(<GoalsGrid goals={goals} />);

  expect(screen.getByRole("region", { name: "Goals" })).toBeVisible();
  expect(screen.getAllByRole("article")).toHaveLength(2);
  expect(screen.getByRole("heading", { name: "Learn shadcn/ui" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Ship a feature" })).toBeVisible();
});

it("renders an informative empty state", () => {
  render(<GoalsGrid goals={[]} />);

  expect(screen.getByRole("region", { name: "Goals" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "No goals yet", level: 2 })).toBeVisible();
  expect(screen.getByText("Goals you create will show up here.")).toBeVisible();
});
