import { TaskCard } from "./task-card";
import type { Task } from "../types/task";
import { render, screen } from "@/test/test-utils";
import { vi } from "vite-plus/test";

vi.mock("./task-date", () => ({
  TaskDate: ({ timestamp }: { timestamp: string }) => <time dateTime={timestamp}>{timestamp}</time>,
}));

const task: Task = {
  reference_xid: "task_01",
  inserted_at: "2026-08-20T12:00:00Z",
  updated_at: "2026-08-21T12:00:00Z",
  name: "Draft Sendero case study",
  description: "Write a concise case study that explains the problem, approach, and outcome.",
  status: "in_progress",
  due_at: "2026-09-28T12:00:00Z",
  goal_reference_xid: "goal_01",
  parent_reference_xid: null,
  tags: [],
};

it("shows the task description between its heading and metadata", () => {
  render(<TaskCard task={task} />);

  expect(screen.getByRole("article", { name: task.name })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: task.name, level: 2 })).toBeInTheDocument();
  expect(screen.getByText(task.description)).toBeInTheDocument();
});

it("omits the description region when the task description is empty", () => {
  const { container } = render(<TaskCard task={{ ...task, description: "" }} />);

  expect(container.querySelector('[data-slot="card-content"]')).not.toBeInTheDocument();
});
