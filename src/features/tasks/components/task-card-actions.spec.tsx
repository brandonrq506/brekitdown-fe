import userEvent from "@testing-library/user-event";
import { useQuery } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { vi } from "vite-plus/test";

import { TaskCard } from "./task-card";
import { goalDetailsPageTasksQueryOptions } from "@/features/tasks/api/queries";
import { TASK_STATUS, type Task } from "@/features/tasks/types/task";
import { api, TASKS_ENDPOINT } from "@/libs/axios";
import { server } from "@/test/server";
import { render, screen, waitFor, within } from "@/test/test-utils";

vi.mock("./task-date", () => ({
  TaskDate: ({ timestamp }: { timestamp: string }) => <time dateTime={timestamp}>{timestamp}</time>,
}));

const TASKS_URL = `${api.defaults.baseURL}${TASKS_ENDPOINT}`;

const task: Task = {
  reference_xid: "task_01",
  inserted_at: "2026-08-20T12:00:00Z",
  updated_at: "2026-08-21T12:00:00Z",
  name: "Draft Sendero case study",
  description: "Explain the problem, approach, and outcome.",
  status: TASK_STATUS.IN_PROGRESS,
  due_at: "2026-09-28T12:00:00Z",
  goal_reference_xid: "goal_01",
  parent_reference_xid: null,
  time_entries: [],
  has_children: false,
  tags: [],
};

const otherTask: Task = {
  ...task,
  reference_xid: "task_02",
  name: "Publish Sendero case study",
};

const TaskListProbe = () => {
  const { data } = useQuery(goalDetailsPageTasksQueryOptions("goal_01"));

  if (data === undefined) return <p role="status">Loading tasks</p>;

  return (
    <>
      <p>
        {data.data.length} {data.data.length === 1 ? "task" : "tasks"}
      </p>
      <section aria-label="Tasks">
        {data.data.map((listedTask) => (
          <TaskCard key={listedTask.reference_xid} task={listedTask} />
        ))}
        {data.data.length === 0 && <p>No tasks for this goal yet.</p>}
      </section>
    </>
  );
};

const openTaskActions = async (user: ReturnType<typeof userEvent.setup>, selectedTask: Task) => {
  const card = screen.getByRole("article", { name: selectedTask.name });
  within(card)
    .getByRole("button", { name: `Task actions for ${selectedTask.name}` })
    .focus();
  await user.keyboard("{ArrowDown}");
};

it.each(Object.values(TASK_STATUS))(
  "shows task actions for a task with the %s status",
  (status) => {
    render(<TaskCard task={{ ...task, status }} />);

    expect(
      screen.getByRole("button", { name: `Task actions for ${task.name}` }),
    ).toBeInTheDocument();
  },
);

it("shows task actions for a task with subtasks", () => {
  render(<TaskCard task={{ ...task, has_children: true }} />);

  expect(screen.getByRole("button", { name: `Task actions for ${task.name}` })).toBeInTheDocument();
});

it("starts deletion immediately from the destructive menu item", async () => {
  const user = userEvent.setup();
  let resolveRequest!: () => void;
  const requestGate = new Promise<void>((resolve) => {
    resolveRequest = resolve;
  });
  server.use(
    http.delete(`${TASKS_URL}/${task.reference_xid}`, async () => {
      await requestGate;
      return new HttpResponse(null, { status: 204 });
    }),
  );
  render(<TaskCard task={task} />);

  await openTaskActions(user, task);
  await user.click(screen.getByRole("menuitem", { name: "Delete task" }));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: `Task actions for ${task.name}` })).toBeDisabled();

  resolveRequest();
  await waitFor(() => {
    expect(screen.getByRole("button", { name: `Task actions for ${task.name}` })).toBeEnabled();
  });
});

it("removes the last task, updates the count, and shows the empty state", async () => {
  const user = userEvent.setup();
  const taskWithRunningTimer: Task = {
    ...task,
    time_entries: [
      {
        reference_xid: "entry_01",
        inserted_at: "2026-09-11T12:00:00Z",
        updated_at: "2026-09-11T12:00:00Z",
        started_at: "2026-09-11T12:00:00Z",
        ended_at: null,
      },
    ],
  };
  server.use(
    http.get(TASKS_URL, () => HttpResponse.json({ data: [taskWithRunningTimer] })),
    http.delete(
      `${TASKS_URL}/${task.reference_xid}`,
      () => new HttpResponse(null, { status: 204 }),
    ),
  );
  render(<TaskListProbe />);
  expect(await screen.findByText("1 task")).toBeInTheDocument();
  server.use(http.get(TASKS_URL, () => HttpResponse.json({ data: [] })));

  await openTaskActions(user, taskWithRunningTimer);
  await user.click(screen.getByRole("menuitem", { name: "Delete task" }));

  expect(await screen.findByText("0 tasks")).toBeInTheDocument();
  expect(screen.getByText("No tasks for this goal yet.")).toBeInTheDocument();
  expect(screen.queryByRole("article", { name: task.name })).not.toBeInTheDocument();
});

it("reflects the server cascade after deleting a parent without removing unrelated tasks", async () => {
  const user = userEvent.setup();
  const parentTask: Task = { ...task, has_children: true };
  const childTask: Task = {
    ...otherTask,
    reference_xid: "task_child",
    name: "Edit Sendero case study",
    parent_reference_xid: parentTask.reference_xid,
  };
  server.use(
    http.get(TASKS_URL, () => HttpResponse.json({ data: [parentTask, childTask, otherTask] })),
    http.delete(
      `${TASKS_URL}/${parentTask.reference_xid}`,
      () => new HttpResponse(null, { status: 204 }),
    ),
  );
  render(<TaskListProbe />);
  expect(await screen.findByText("3 tasks")).toBeInTheDocument();
  server.use(http.get(TASKS_URL, () => HttpResponse.json({ data: [otherTask] })));

  await openTaskActions(user, parentTask);
  await user.click(screen.getByRole("menuitem", { name: "Delete task" }));

  expect(await screen.findByText("1 task")).toBeInTheDocument();
  expect(screen.queryByRole("article", { name: parentTask.name })).not.toBeInTheDocument();
  expect(screen.queryByRole("article", { name: childTask.name })).not.toBeInTheDocument();
  expect(screen.getByRole("article", { name: otherTask.name })).toBeInTheDocument();
});

it("keeps the task visible and shows an error when deletion fails", async () => {
  const user = userEvent.setup();
  server.use(
    http.delete(`${TASKS_URL}/${task.reference_xid}`, () =>
      HttpResponse.json({ errors: { detail: "Temporary failure" } }, { status: 503 }),
    ),
  );
  render(<TaskCard task={task} />);

  await openTaskActions(user, task);
  await user.click(screen.getByRole("menuitem", { name: "Delete task" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "We couldn't delete this task. Please try again.",
  );
  expect(screen.getByRole("article", { name: task.name })).toBeInTheDocument();
});
