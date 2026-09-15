import { render, screen, waitFor, waitForElementToBeRemoved, within } from "@/test/test-utils";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";

import { apiRoutes } from "@/test/handlers/api-routes";
import { mockGoalResponse } from "@/test/handlers/goals";
import { newlyCreatedGoal } from "@/test/store/goals";
import { server } from "@/test/server";

import { CreateGoalDialog } from "../create-goal-dialog";

type User = ReturnType<typeof userEvent.setup>;

interface Dismissal {
  label: string;
  dismiss: (user: User, dialog: HTMLElement) => Promise<void>;
}

const openDialog = async (user: User) => {
  await user.click(screen.getByRole("button", { name: "Create goal" }));

  return screen.findByRole("dialog", { name: "Create goal" });
};

const dismissals: Dismissal[] = [
  {
    label: "the Cancel button",
    dismiss: (user, dialog) => user.click(within(dialog).getByRole("button", { name: "Cancel" })),
  },
  {
    label: "the close button",
    dismiss: (user, dialog) => user.click(within(dialog).getByRole("button", { name: "Close" })),
  },
  { label: "Escape", dismiss: (user) => user.keyboard("{Escape}") },
  { label: "the backdrop", dismiss: (user) => user.click(document.body) },
];

/** Holds the creation request open until the test releases it. */
const gatedCreateGoalHandler = () => {
  let resolveRequest!: () => void;
  const requestGate = new Promise<void>((resolve) => {
    resolveRequest = resolve;
  });
  const handler = http.post(apiRoutes.goals, async () => {
    await requestGate;

    return mockGoalResponse(newlyCreatedGoal, { status: 201 });
  });

  return { handler, resolveRequest };
};

it.each(dismissals)("closes when dismissed with $label", async ({ dismiss }) => {
  const user = userEvent.setup();
  render(<CreateGoalDialog />);
  const dialog = await openDialog(user);

  await dismiss(user, dialog);

  expect(screen.queryByRole("dialog", { name: "Create goal" })).not.toBeInTheDocument();
});

it.each(dismissals)("discards the draft when dismissed with $label", async ({ dismiss }) => {
  const user = userEvent.setup();
  render(<CreateGoalDialog />);
  const dialog = await openDialog(user);
  await user.type(within(dialog).getByRole("textbox", { name: "Name" }), "Draft goal");
  await dismiss(user, dialog);

  const reopenedDialog = await openDialog(user);

  expect(within(reopenedDialog).getByRole("textbox", { name: "Name" })).toHaveValue("");
});

it("shows a disabled Creating… button while the goal is being created", async () => {
  const user = userEvent.setup();
  const { handler, resolveRequest } = gatedCreateGoalHandler();
  server.use(handler);
  render(<CreateGoalDialog />);
  const dialog = await openDialog(user);
  await user.type(within(dialog).getByRole("textbox", { name: "Name" }), "Ship release");

  await user.click(within(dialog).getByRole("button", { name: "Create goal" }));

  expect(within(dialog).getByRole("button", { name: "Creating…" })).toBeDisabled();

  resolveRequest();
  await waitForElementToBeRemoved(() => screen.queryByRole("button", { name: "Creating…" }));
});

it("disables the close button while the goal is being created", async () => {
  const user = userEvent.setup();
  const { handler, resolveRequest } = gatedCreateGoalHandler();
  server.use(handler);
  render(<CreateGoalDialog />);
  const dialog = await openDialog(user);
  await user.type(within(dialog).getByRole("textbox", { name: "Name" }), "Ship release");

  await user.click(within(dialog).getByRole("button", { name: "Create goal" }));

  expect(within(dialog).getByRole("button", { name: "Close" })).toBeDisabled();

  resolveRequest();
  await waitForElementToBeRemoved(() => screen.queryByRole("button", { name: "Creating…" }));
});

it("ignores Escape while the goal is being created", async () => {
  const user = userEvent.setup();
  const { handler, resolveRequest } = gatedCreateGoalHandler();
  server.use(handler);
  render(<CreateGoalDialog />);
  const dialog = await openDialog(user);
  await user.type(within(dialog).getByRole("textbox", { name: "Name" }), "Ship release");
  await user.click(within(dialog).getByRole("button", { name: "Create goal" }));

  await user.keyboard("{Escape}");

  expect(screen.getByRole("dialog", { name: "Create goal" })).toBeVisible();

  resolveRequest();
  await waitForElementToBeRemoved(() => screen.queryByRole("button", { name: "Creating…" }));
});

it("ignores a backdrop click while the goal is being created", async () => {
  const user = userEvent.setup();
  const { handler, resolveRequest } = gatedCreateGoalHandler();
  server.use(handler);
  render(<CreateGoalDialog />);
  const dialog = await openDialog(user);
  await user.type(within(dialog).getByRole("textbox", { name: "Name" }), "Ship release");
  await user.click(within(dialog).getByRole("button", { name: "Create goal" }));

  await user.click(document.body);

  expect(screen.getByRole("dialog", { name: "Create goal" })).toBeVisible();

  resolveRequest();
  await waitForElementToBeRemoved(() => screen.queryByRole("button", { name: "Creating…" }));
});

it("navigates to the created goal after a successful request", async () => {
  const user = userEvent.setup();
  const { router } = render(<CreateGoalDialog />);
  const dialog = await openDialog(user);
  await user.type(within(dialog).getByRole("textbox", { name: "Name" }), "Ship release");

  await user.click(within(dialog).getByRole("button", { name: "Create goal" }));

  await waitFor(() => {
    expect(router.state.location.pathname).toBe("/goals/goal_created");
  });
});

it("shows the server's name error on the Name field", async () => {
  const user = userEvent.setup();
  server.use(
    http.post(apiRoutes.goals, () =>
      HttpResponse.json({ errors: { name: ["has already been taken"] } }, { status: 422 }),
    ),
  );
  render(<CreateGoalDialog />);
  const dialog = await openDialog(user);
  await user.type(within(dialog).getByRole("textbox", { name: "Name" }), "Existing goal");

  await user.click(within(dialog).getByRole("button", { name: "Create goal" }));

  expect(await within(dialog).findByRole("alert")).toHaveTextContent("has already been taken");
  expect(within(dialog).getByRole("textbox", { name: "Name" })).toHaveAccessibleDescription(
    /has already been taken/,
  );
});

it("closes on Escape after creation fails", async () => {
  const user = userEvent.setup();
  server.use(http.post(apiRoutes.goals, () => HttpResponse.error()));
  render(<CreateGoalDialog />);
  const dialog = await openDialog(user);
  await user.type(within(dialog).getByRole("textbox", { name: "Name" }), "Ship release");
  await user.click(within(dialog).getByRole("button", { name: "Create goal" }));
  await within(dialog).findByRole("alert");

  await user.keyboard("{Escape}");

  expect(screen.queryByRole("dialog", { name: "Create goal" })).not.toBeInTheDocument();
});
