import userEvent from "@testing-library/user-event";
import { useQuery } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";

import { TaskCard } from "../task-card";
import { goalDetailsPageTasksQueryOptions } from "../../api/queries";
import { TASK_STATUS, type Task } from "../../types/task";
import type { TimeEntry } from "@/features/time-entries/types/time-entry";
import { api, TASKS_ENDPOINT } from "@/libs/axios";
import { server } from "@/test/server";
import { render, screen, waitFor, within } from "@/test/test-utils";

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

const runningTimeEntry: TimeEntry = {
  reference_xid: "time_entry_01",
  inserted_at: "2026-09-12T09:00:00Z",
  updated_at: "2026-09-12T09:00:00Z",
  started_at: "2026-09-12T09:00:00Z",
  ended_at: null,
};

const endedTimeEntry: TimeEntry = {
  ...runningTimeEntry,
  reference_xid: "time_entry_02",
  ended_at: "2026-09-12T10:00:00Z",
};

const TaskListProbe = () => {
  const { data } = useQuery(goalDetailsPageTasksQueryOptions("goal_01"));

  if (data === undefined) return null;

  return (
    <>
      {data.data.map((listedTask) => (
        <TaskCard key={listedTask.reference_xid} task={listedTask} />
      ))}
      {data.data.length === 0 && <p>No tasks for this goal yet.</p>}
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

it.each([TASK_STATUS.SCHEDULED, TASK_STATUS.IN_PROGRESS, TASK_STATUS.DROPPED, TASK_STATUS.ON_HOLD])(
  "offers Start on a task with the %s status",
  (status) => {
    render(<TaskCard task={{ ...task, status }} />);

    expect(screen.getByRole("button", { name: "Start" })).toBeVisible();
  },
);

it("offers Start when every time entry of the task has ended", () => {
  render(<TaskCard task={{ ...task, time_entries: [endedTimeEntry] }} />);

  expect(screen.getByRole("button", { name: "Start" })).toBeVisible();
});

it("offers Stop when the task has a running time entry", () => {
  render(<TaskCard task={{ ...task, time_entries: [endedTimeEntry, runningTimeEntry] }} />);

  expect(screen.getByRole("button", { name: "Stop" })).toBeVisible();
});

it("offers no timer action on a completed task", () => {
  render(<TaskCard task={{ ...task, status: TASK_STATUS.COMPLETED }} />);

  expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Stop" })).not.toBeInTheDocument();
});

it("offers no timer action on a task with subtasks", () => {
  render(<TaskCard task={{ ...task, has_children: true, time_entries: [runningTimeEntry] }} />);

  expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Stop" })).not.toBeInTheDocument();
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

it("shows the empty state after the last task is deleted", async () => {
  const user = userEvent.setup();
  server.use(
    http.get(TASKS_URL, () => HttpResponse.json({ data: [task] }), { once: true }),
    http.get(TASKS_URL, () => HttpResponse.json({ data: [] })),
    http.delete(
      `${TASKS_URL}/${task.reference_xid}`,
      () => new HttpResponse(null, { status: 204 }),
    ),
  );
  render(<TaskListProbe />);
  await screen.findByRole("article", { name: task.name });

  await openTaskActions(user, task);
  await user.click(screen.getByRole("menuitem", { name: "Delete task" }));

  expect(await screen.findByText("No tasks for this goal yet.")).toBeVisible();
  expect(screen.queryByRole("article", { name: task.name })).not.toBeInTheDocument();
});

it("shows a retry message when deletion fails", async () => {
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
  expect(screen.getByRole("article", { name: task.name })).toBeVisible();
});
