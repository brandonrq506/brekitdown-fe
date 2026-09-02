import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { CreateGoalDialog } from "./create-goal-dialog";
import type { CreateGoalPayload, GoalResponse } from "../types/goal";
import { api, GOALS_ENDPOINT } from "@/libs/axios";
import { server } from "@/test/server";
import { render, screen, waitFor } from "@/test/test-utils";

const GOALS_URL = `${api.defaults.baseURL}${GOALS_ENDPOINT}`;

const goalResponse: GoalResponse = {
  data: {
    reference_xid: "goal_created",
    inserted_at: "2026-08-31T12:00:00Z",
    updated_at: "2026-08-31T12:00:00Z",
    name: "Ship release",
    description: null,
  },
};

const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Create goal" }));
  return screen.getByRole("dialog", { name: "Create goal" });
};

const expectDialogClosed = async () => {
  await waitFor(() => {
    expect(screen.queryByRole("dialog", { name: "Create goal" })).not.toBeInTheDocument();
  });
};

it("discards the draft when canceled", async () => {
  const user = userEvent.setup();
  render(<CreateGoalDialog />);

  await openDialog(user);
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Draft goal");
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  await expectDialogClosed();

  await openDialog(user);
  expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("");
});

it("discards the draft when the close button is pressed", async () => {
  const user = userEvent.setup();
  render(<CreateGoalDialog />);

  await openDialog(user);
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Draft goal");
  await user.click(screen.getByRole("button", { name: "Close" }));
  await expectDialogClosed();

  await openDialog(user);
  expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("");
});

it("discards the draft when Escape is pressed", async () => {
  const user = userEvent.setup();
  render(<CreateGoalDialog />);

  await openDialog(user);
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Draft goal");
  await user.keyboard("{Escape}");
  await expectDialogClosed();

  await openDialog(user);
  expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("");
});

it("discards the draft when the backdrop is pressed", async () => {
  const user = userEvent.setup();
  render(<CreateGoalDialog />);

  await openDialog(user);
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Draft goal");
  await user.click(document.body);
  await expectDialogClosed();

  await openDialog(user);
  expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("");
});

it("shows a required error when submitted without a name", async () => {
  const user = userEvent.setup();

  render(<CreateGoalDialog />);

  await openDialog(user);
  await user.click(screen.getByRole("button", { name: "Create goal" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Goal name is required.");
});

it("treats a whitespace-only name as empty", async () => {
  const user = userEvent.setup();

  render(<CreateGoalDialog />);

  await openDialog(user);
  await user.type(screen.getByRole("textbox", { name: "Name" }), "   ");
  await user.click(screen.getByRole("button", { name: "Create goal" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Goal name is required.");
});

it("sends normalized form values to the API", async () => {
  const user = userEvent.setup();
  let submittedPayload: CreateGoalPayload | undefined;
  server.use(
    http.post<never, CreateGoalPayload, GoalResponse>(GOALS_URL, async ({ request }) => {
      submittedPayload = await request.json();
      return HttpResponse.json(goalResponse, { status: 201 });
    }),
  );
  render(<CreateGoalDialog />);

  await openDialog(user);
  await user.type(screen.getByRole("textbox", { name: "Name" }), "  Ship release  ");
  await user.type(screen.getByRole("textbox", { name: "Description" }), "   ");
  await user.click(screen.getByRole("button", { name: "Create goal" }));

  await waitFor(() => {
    expect(submittedPayload).toEqual({
      goal: { name: "Ship release", description: null },
    });
  });
});

it("locks the dialog while creation is pending", async () => {
  const user = userEvent.setup();
  let resolveRequest!: () => void;
  const requestGate = new Promise<void>((resolve) => {
    resolveRequest = resolve;
  });
  server.use(
    http.post(GOALS_URL, async () => {
      await requestGate;
      return HttpResponse.json(goalResponse, { status: 201 });
    }),
  );
  render(<CreateGoalDialog />);

  await openDialog(user);
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Ship release");
  await user.click(screen.getByRole("button", { name: "Create goal" }));

  expect(screen.getByRole("button", { name: "Creating…" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Close" })).toBeDisabled();

  await user.keyboard("{Escape}");
  await user.click(document.body);
  expect(screen.getByRole("dialog", { name: "Create goal" })).toBeInTheDocument();

  resolveRequest();
  await waitFor(() => {
    expect(screen.queryByRole("button", { name: "Creating…" })).not.toBeInTheDocument();
  });
});

it("navigates to the created goal after a successful request", async () => {
  const user = userEvent.setup();
  server.use(
    http.post(GOALS_URL, () => {
      return HttpResponse.json(goalResponse, { status: 201 });
    }),
  );
  const { router } = render(<CreateGoalDialog />);

  await openDialog(user);
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Ship release");
  await user.click(screen.getByRole("button", { name: "Create goal" }));

  await waitFor(() => {
    expect(router.state.location.pathname).toBe("/goals/goal_created");
  });
});

it("shows API name validation errors on the name field", async () => {
  const user = userEvent.setup();
  server.use(
    http.post(GOALS_URL, () => {
      return HttpResponse.json({ errors: { name: ["has already been taken"] } }, { status: 422 });
    }),
  );
  render(<CreateGoalDialog />);

  await openDialog(user);
  const name = screen.getByRole("textbox", { name: "Name" });
  await user.type(name, "Existing goal");
  await user.click(screen.getByRole("button", { name: "Create goal" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("has already been taken");
});

it("shows non-validation failures at form level", async () => {
  const user = userEvent.setup();
  server.use(
    http.post(GOALS_URL, () => {
      return HttpResponse.json({ errors: { detail: "Internal Server Error" } }, { status: 500 });
    }),
  );
  render(<CreateGoalDialog />);

  await openDialog(user);
  const name = screen.getByRole("textbox", { name: "Name" });
  await user.type(name, "Keep this value");
  await user.click(screen.getByRole("button", { name: "Create goal" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "We couldn't create your goal. Please try again.",
  );
});

it("keeps entered values after a request fails", async () => {
  const user = userEvent.setup();
  server.use(
    http.post(GOALS_URL, () => {
      return HttpResponse.json({ errors: { detail: "Internal Server Error" } }, { status: 500 });
    }),
  );
  render(<CreateGoalDialog />);

  await openDialog(user);
  const name = screen.getByRole("textbox", { name: "Name" });
  await user.type(name, "Keep this value");
  await user.click(screen.getByRole("button", { name: "Create goal" }));
  await screen.findByRole("alert");

  expect(name).toHaveValue("Keep this value");
});
