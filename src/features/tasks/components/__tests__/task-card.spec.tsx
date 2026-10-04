import { TaskCard } from "../task-card";
import { TASK_STATUS, type Task, type TASK_STATUS as TaskStatus } from "../../types/task";
import { buildTask, task } from "@/test/store/tasks";
import { render, screen } from "@/test/test-utils";

/** The goal page's composition: this spec covers the card as a whole. */
const GoalPageCard = ({ task }: { task: Task }) => (
  <TaskCard.Root task={task}>
    <TaskCard.Header>
      <TaskCard.Status />
      <TaskCard.Title />
      <TaskCard.Actions>
        <TaskCard.Timer />
        <TaskCard.Menu />
      </TaskCard.Actions>
    </TaskCard.Header>
    <TaskCard.Description />
    <TaskCard.Footer>
      <TaskCard.StatusDetails />
      <TaskCard.Notes />
    </TaskCard.Footer>
  </TaskCard.Root>
);

const statusIcons: [label: string, status: TaskStatus][] = [
  ["Scheduled", TASK_STATUS.SCHEDULED],
  ["In progress", TASK_STATUS.IN_PROGRESS],
  ["Completed", TASK_STATUS.COMPLETED],
  ["Dropped", TASK_STATUS.DROPPED],
  ["On hold", TASK_STATUS.ON_HOLD],
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
  render(<GoalPageCard task={task} />);

  expect(screen.getByRole("article", { name: task.name })).toBeVisible();
  expect(screen.getByRole("heading", { name: task.name, level: 2 })).toBeVisible();
});

it("shows the task's description", () => {
  render(<GoalPageCard task={task} />);

  expect(screen.getByText(task.description)).toBeVisible();
});

it.each(statusIcons)("shows the %s status icon", (label, status) => {
  render(<GoalPageCard task={buildTask({ status })} />);

  expect(screen.getByRole("button", { name: `Status: ${label}` })).toBeVisible();
});

it("shows how long ago the task was created", () => {
  pinToday("2026-09-13T12:00:00Z");
  render(<GoalPageCard task={task} />);

  expect(screen.getByRole("article", { name: task.name })).toHaveTextContent(
    /Created\s*last month/,
  );
});

it("shows the day the task is due", () => {
  pinToday("2026-09-13T12:00:00Z");
  render(<GoalPageCard task={task} />);

  expect(screen.getByRole("article", { name: task.name })).toHaveTextContent(/Due\s*Sep 28/);
});

it("shows how many notes the task has", () => {
  render(<GoalPageCard task={task} />);

  expect(screen.getByRole("article", { name: task.name })).toHaveTextContent(/Notes\s*5/);
});

it("tells the user the task has no due date when none is set", () => {
  render(<GoalPageCard task={buildTask({ due_at: null })} />);

  expect(screen.getByText("No due date")).toBeVisible();
});
