import { vi } from "vite-plus/test";

import { TaskCard } from "../task-card";
import { TASK_STATUS } from "../../types/task";
import { buildTask, task } from "@/test/store/tasks";
import { render, screen } from "@/test/test-utils";

afterEach(() => {
  vi.useRealTimers();
});

it("shows the task's name as the card's heading", () => {
  render(<TaskCard task={task} />);

  expect(screen.getByRole("article", { name: task.name })).toBeVisible();
  expect(screen.getByRole("heading", { name: task.name, level: 2 })).toBeVisible();
});

it("shows the task's description", () => {
  render(<TaskCard task={task} />);

  expect(screen.getByText(task.description)).toBeVisible();
});

it.each([
  [TASK_STATUS.SCHEDULED, "Scheduled"],
  [TASK_STATUS.IN_PROGRESS, "In progress"],
  [TASK_STATUS.COMPLETED, "Completed"],
  [TASK_STATUS.DROPPED, "Dropped"],
  [TASK_STATUS.ON_HOLD, "On hold"],
] as const)("names a %s task's status icon %s", (status, label) => {
  render(<TaskCard task={buildTask({ status })} />);

  expect(screen.getByRole("img", { name: label })).toBeVisible();
});

it("shows how long ago the task was created", () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime("2026-09-13T12:00:00Z");

  render(<TaskCard task={task} />);

  expect(screen.getByRole("article", { name: task.name })).toHaveTextContent(
    /Created\s*last month/,
  );
});

it("shows the day the task is due", () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime("2026-09-13T12:00:00Z");

  render(<TaskCard task={task} />);

  expect(screen.getByRole("article", { name: task.name })).toHaveTextContent(/Due\s*Sep 28/);
});

it("tells the user the task has no due date when none is set", () => {
  render(<TaskCard task={buildTask({ due_at: null })} />);

  expect(screen.getByText("No due date")).toBeVisible();
});
