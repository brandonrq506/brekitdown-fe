import userEvent from "@testing-library/user-event";
import { http } from "msw";

import { apiRoutes } from "@/test/handlers/api-routes";
import { mockTaskResponse } from "@/test/handlers/tasks";
import { server } from "@/test/server";
import { goal } from "@/test/store/goals";
import { newlyCreatedTask } from "@/test/store/tasks";
import { render, screen, waitFor, waitForElementToBeRemoved, within } from "@/test/test-utils";
import { CreateTaskDialog } from "../create-task-dialog";

type User = ReturnType<typeof userEvent.setup>;

const openDialog = async (user: User) => {
  await user.click(screen.getByRole("button", { name: "Create task" }));

  return screen.findByRole("dialog", { name: "Create task" });
};

const submitDraft = async (user: User, dialog: HTMLElement) => {
  await user.type(within(dialog).getByRole("textbox", { name: "Task title" }), "Draft the outline");

  await user.click(within(dialog).getByRole("button", { name: "Create task" }));
};

/** Holds the creation request open until the test releases it. */
const gatedCreateTaskHandler = () => {
  const { promise, resolve } = Promise.withResolvers<void>();
  const handler = http.post(apiRoutes.tasks, async () => {
    await promise;

    return mockTaskResponse(newlyCreatedTask, { status: 201 });
  });

  return { handler, releaseRequest: resolve };
};

const waitForCreationToSettle = () =>
  waitForElementToBeRemoved(() => screen.queryByRole("button", { name: "Creating…" }));

it("focuses the task title when the dialog opens", async () => {
  const user = userEvent.setup();
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  expect(within(dialog).getByRole("textbox", { name: "Task title" })).toHaveFocus();
});

it("rejects a task title made only of spaces", async () => {
  const user = userEvent.setup();
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await user.type(within(dialog).getByRole("textbox", { name: "Task title" }), "   ");

  await user.click(within(dialog).getByRole("button", { name: "Create task" }));

  expect(await within(dialog).findByRole("alert")).toHaveTextContent("Task title is required.");
});

it("closes the dialog once the task is created", async () => {
  const user = userEvent.setup();
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await submitDraft(user, dialog);

  await waitFor(() => {
    expect(screen.queryByRole("dialog", { name: "Create task" })).not.toBeInTheDocument();
  });
});

it("closes the dialog when Cancel is clicked", async () => {
  const user = userEvent.setup();
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

  expect(screen.queryByRole("dialog", { name: "Create task" })).not.toBeInTheDocument();
});

it("reopens with an empty draft after the dialog is cancelled", async () => {
  const user = userEvent.setup();
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await user.type(within(dialog).getByRole("textbox", { name: "Task title" }), "Unsaved draft");

  await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

  const reopenedDialog = await openDialog(user);

  expect(within(reopenedDialog).getByRole("textbox", { name: "Task title" })).toHaveValue("");
});

it("shows a disabled Creating… button while the task is being created", async () => {
  const user = userEvent.setup();
  const { handler, releaseRequest } = gatedCreateTaskHandler();
  server.use(handler);
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await submitDraft(user, dialog);

  expect(within(dialog).getByRole("button", { name: "Creating…" })).toBeDisabled();

  releaseRequest();
  await waitForCreationToSettle();
});

it("disables Cancel while the task is being created", async () => {
  const user = userEvent.setup();
  const { handler, releaseRequest } = gatedCreateTaskHandler();
  server.use(handler);
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await submitDraft(user, dialog);

  expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeDisabled();

  releaseRequest();
  await waitForCreationToSettle();
});

it("disables the close button while the task is being created", async () => {
  const user = userEvent.setup();
  const { handler, releaseRequest } = gatedCreateTaskHandler();
  server.use(handler);
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await submitDraft(user, dialog);

  expect(within(dialog).getByRole("button", { name: "Close" })).toBeDisabled();

  releaseRequest();
  await waitForCreationToSettle();
});

it("ignores Escape while the task is being created", async () => {
  const user = userEvent.setup();
  const { handler, releaseRequest } = gatedCreateTaskHandler();
  server.use(handler);
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await submitDraft(user, dialog);

  await user.keyboard("{Escape}");

  expect(screen.getByRole("dialog", { name: "Create task" })).toBeVisible();

  releaseRequest();
  await waitForCreationToSettle();
});

it("ignores a backdrop click while the task is being created", async () => {
  const user = userEvent.setup();
  const { handler, releaseRequest } = gatedCreateTaskHandler();
  server.use(handler);
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await submitDraft(user, dialog);

  await user.click(document.body);

  expect(screen.getByRole("dialog", { name: "Create task" })).toBeVisible();

  releaseRequest();
  await waitForCreationToSettle();
});
