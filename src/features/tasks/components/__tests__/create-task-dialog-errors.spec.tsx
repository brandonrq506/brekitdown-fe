import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { apiRoutes } from "@/test/handlers/api-routes";
import { server } from "@/test/server";
import { goal } from "@/test/store/goals";
import { render, screen, within } from "@/test/test-utils";
import { CreateTaskDialog } from "../create-task-dialog";

type User = ReturnType<typeof userEvent.setup>;

const RETRY_MESSAGE = "We couldn't create your task. Please try again.";

const openDialog = async (user: User) => {
  await user.click(screen.getByRole("button", { name: "Create task" }));

  return screen.findByRole("dialog", { name: "Create task" });
};

const submitDraft = async (user: User, dialog: HTMLElement) => {
  await user.type(within(dialog).getByRole("textbox", { name: "Task title" }), "Draft the outline");

  await user.click(within(dialog).getByRole("button", { name: "Create task" }));
};

it("shows the server's error on the task title", async () => {
  const user = userEvent.setup();
  server.use(
    http.post(apiRoutes.tasks, () =>
      HttpResponse.json({ errors: { name: ["is too long"] } }, { status: 422 }),
    ),
  );
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await submitDraft(user, dialog);

  const titleField = within(dialog).getByRole("textbox", { name: "Task title" });

  expect(await within(dialog).findByRole("alert")).toHaveTextContent("is too long");
  expect(titleField).toBeInvalid();
});

it("shows the server's error on the description", async () => {
  const user = userEvent.setup();
  server.use(
    http.post(apiRoutes.tasks, () =>
      HttpResponse.json({ errors: { description: ["is too long"] } }, { status: 422 }),
    ),
  );
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await submitDraft(user, dialog);

  const descriptionField = within(dialog).getByRole("textbox", { name: "Description" });

  expect(await within(dialog).findByRole("alert")).toHaveTextContent("is too long");
  expect(descriptionField).toBeInvalid();
});

it("shows the retry message when the server rejects a field the form does not offer", async () => {
  const user = userEvent.setup();
  server.use(
    http.post(apiRoutes.tasks, () =>
      HttpResponse.json({ errors: { goal_reference_xid: ["does not exist"] } }, { status: 422 }),
    ),
  );
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await submitDraft(user, dialog);

  expect(await within(dialog).findByRole("alert")).toHaveTextContent(RETRY_MESSAGE);
});

it.each<[status: number, detail: string]>([
  [401, "Unauthorized"],
  [500, "Internal Server Error"],
])("shows the retry message when creation fails with HTTP %d", async (status, detail) => {
  const user = userEvent.setup();
  server.use(
    http.post(apiRoutes.tasks, () => HttpResponse.json({ errors: { detail } }, { status })),
  );
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await submitDraft(user, dialog);

  expect(await within(dialog).findByRole("alert")).toHaveTextContent(RETRY_MESSAGE);
});

it("shows the retry message when the network fails", async () => {
  const user = userEvent.setup();
  server.use(http.post(apiRoutes.tasks, () => HttpResponse.error()));
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await submitDraft(user, dialog);

  expect(await within(dialog).findByRole("alert")).toHaveTextContent(RETRY_MESSAGE);
});

it("keeps everything the user typed when creation fails", async () => {
  const user = userEvent.setup();
  server.use(http.post(apiRoutes.tasks, () => HttpResponse.error()));
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);

  const dialog = await openDialog(user);

  await user.type(within(dialog).getByRole("textbox", { name: "Description" }), "Keep my notes");

  await submitDraft(user, dialog);
  await within(dialog).findByRole("alert");

  expect(within(dialog).getByRole("textbox", { name: "Task title" })).toHaveValue(
    "Draft the outline",
  );
  expect(within(dialog).getByRole("textbox", { name: "Description" })).toHaveValue("Keep my notes");
});
