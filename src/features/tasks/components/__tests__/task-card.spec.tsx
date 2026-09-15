import { TaskCard } from "../task-card";
import { TASK_STATUS } from "../../types/task";
import { buildTask, task } from "@/test/store/tasks";
import { render, screen } from "@/test/test-utils";

const statusIcons = [
  { status: TASK_STATUS.SCHEDULED, label: "Scheduled" },
  { status: TASK_STATUS.IN_PROGRESS, label: "In progress" },
  { status: TASK_STATUS.COMPLETED, label: "Completed" },
  { status: TASK_STATUS.DROPPED, label: "Dropped" },
  { status: TASK_STATUS.ON_HOLD, label: "On hold" },
];

/** Both date labels are read against the clock, and `Date` is the only clock Vitest can fake. */
const pinToday = (today: string) => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(today);
};

// `clearMocks` restores mocks between tests, but not the clock.
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

it.each(statusIcons)("shows the $label status icon on a $status task", ({ status, label }) => {
  render(<TaskCard task={buildTask({ status })} />);

  expect(screen.getByRole("img", { name: label })).toBeVisible();
});

it("shows how long ago the task was created", () => {
  pinToday("2026-09-13T12:00:00Z");
  render(<TaskCard task={task} />);

  expect(screen.getByRole("article", { name: task.name })).toHaveTextContent(
    /Created\s*last month/,
  );
});

it("shows the day the task is due", () => {
  pinToday("2026-09-13T12:00:00Z");
  render(<TaskCard task={task} />);

  expect(screen.getByRole("article", { name: task.name })).toHaveTextContent(/Due\s*Sep 28/);
});

it("tells the user the task has no due date when none is set", () => {
  render(<TaskCard task={buildTask({ due_at: null })} />);

  expect(screen.getByText("No due date")).toBeVisible();
});
