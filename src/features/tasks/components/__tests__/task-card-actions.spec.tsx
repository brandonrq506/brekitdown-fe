import userEvent from "@testing-library/user-event";
import { useQuery } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";

import { TaskCard } from "../task-card";
import { goalDetailsPageTasksQueryOptions } from "../../api/queries";
import { apiRoutes } from "@/test/handlers/api-routes";
import { mockTasksResponse } from "@/test/handlers/tasks";
import { server } from "@/test/server";
import { task } from "@/test/store/tasks";
import { render, screen, waitFor, within } from "@/test/test-utils";

type User = ReturnType<typeof userEvent.setup>;

const TaskListProbe = () => {
  const { data } = useQuery(goalDetailsPageTasksQueryOptions(task.goal_reference_xid));

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

/** Base UI only opens the menu from the keyboard in jsdom, so a click on the trigger is not enough. */
const openTaskActions = async (user: User, selectedTask: { name: string }) => {
  const card = screen.getByRole("article", { name: selectedTask.name });
  within(card)
    .getByRole("button", { name: `Task actions for ${selectedTask.name}` })
    .focus();
  await user.keyboard("{ArrowDown}");
};

it("starts deleting the task without asking for confirmation", async () => {
  const user = userEvent.setup();
  let resolveRequest!: () => void;
  const requestGate = new Promise<void>((resolve) => {
    resolveRequest = resolve;
  });
  server.use(
    http.delete(apiRoutes.task(task.reference_xid), async () => {
      await requestGate;

      return new HttpResponse(null, { status: 204 });
    }),
  );
  render(<TaskCard task={task} />);

  await openTaskActions(user, task);

  await user.click(screen.getByRole("menuitem", { name: "Delete task" }));

  const taskActionsButton = screen.getByRole("button", { name: `Task actions for ${task.name}` });

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(taskActionsButton).toBeDisabled();

  resolveRequest();
  await waitFor(() => {
    expect(taskActionsButton).toBeEnabled();
  });
});

it("shows the empty state after the last task is deleted", async () => {
  const user = userEvent.setup();
  server.use(
    http.get(apiRoutes.tasks, () => mockTasksResponse([task]), { once: true }),
    http.get(apiRoutes.tasks, () => mockTasksResponse([])),
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
    http.delete(apiRoutes.task(task.reference_xid), () =>
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
