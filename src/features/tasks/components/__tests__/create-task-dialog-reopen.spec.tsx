import userEvent from "@testing-library/user-event";
import { http } from "msw";

import { CreateTaskDialog } from "../create-task-dialog";
import { apiRoutes } from "@/test/handlers/api-routes";
import { mockGoalCompletedConflict } from "@/test/handlers/goals";
import { mockTaskResponse } from "@/test/handlers/tasks";
import { server } from "@/test/server";
import { completedGoal } from "@/test/store/goals";
import { newlyCreatedTask } from "@/test/store/tasks";
import { render, screen, waitFor, within } from "@/test/test-utils";

afterEach(() => server.events.removeAllListeners());

/** The first creation is refused because the goal is completed; any retry goes through. */
const refuseFirstCreate = () => {
  const requests = { creates: 0, reopens: 0 };
  server.events.on("request:start", ({ request }) => {
    if (request.url === apiRoutes.goalReopen(completedGoal.reference_xid)) requests.reopens += 1;
  });
  server.use(
    http.post(apiRoutes.tasks, () => {
      requests.creates += 1;

      return requests.creates === 1
        ? mockGoalCompletedConflict()
        : mockTaskResponse(newlyCreatedTask, { status: 201 });
    }),
  );

  return requests;
};

const submitTask = async (user: ReturnType<typeof userEvent.setup>) => {
  render(<CreateTaskDialog goalReferenceXid={completedGoal.reference_xid} />);
  await user.click(screen.getByRole("button", { name: "Create task" }));
  const form = await screen.findByRole("dialog", { name: "Create task" });
  await user.type(within(form).getByRole("textbox", { name: "Task title" }), "Draft the outline");
  await user.click(within(form).getByRole("button", { name: "Create task" }));

  return form;
};

it("asks to reopen the goal instead of showing a form error", async () => {
  const user = userEvent.setup();
  refuseFirstCreate();

  const form = await submitTask(user);

  const dialog = await screen.findByRole("dialog", { name: "Reopen this goal?" });
  expect(dialog).toHaveTextContent("Continuing will remove its completed status.");
  expect(within(form).queryByRole("alert")).not.toBeInTheDocument();
});

it("reopens the goal and retries the creation on confirm", async () => {
  const user = userEvent.setup();
  const requests = refuseFirstCreate();

  await submitTask(user);
  await user.click(await screen.findByRole("button", { name: "Reopen and continue" }));

  await waitFor(() => expect(requests).toEqual({ creates: 2, reopens: 1 }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});

it("keeps the draft and creates nothing when the reopen is cancelled", async () => {
  const user = userEvent.setup();
  const requests = refuseFirstCreate();

  const form = await submitTask(user);
  await user.click(await screen.findByRole("button", { name: "Cancel" }));

  await waitFor(() =>
    expect(screen.queryByRole("dialog", { name: "Reopen this goal?" })).not.toBeInTheDocument(),
  );
  expect(requests).toEqual({ creates: 1, reopens: 0 });
  expect(within(form).getByRole("textbox", { name: "Task title" })).toHaveValue(
    "Draft the outline",
  );
});
