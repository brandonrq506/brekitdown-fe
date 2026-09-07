import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { CreateGoalDialog } from "./create-goal-dialog";
import type { CreateGoalPayload, GoalResponse } from "../types/goal";
import { api, GOALS_ENDPOINT } from "@/libs/axios";
import { server } from "@/test/server";
import { render, screen, waitFor } from "@/test/test-utils";

const GOALS_URL = `${api.defaults.baseURL}${GOALS_ENDPOINT}`;

type User = ReturnType<typeof userEvent.setup>;

const goalResponse: GoalResponse = {
  data: {
    reference_xid: "goal_created",
    inserted_at: "2026-08-31T12:00:00Z",
    updated_at: "2026-08-31T12:00:00Z",
    name: "Ship release",
    description: null,
  },
};

const openDialog = async (user: User) => {
  await user.click(screen.getByRole("button", { name: "Create goal" }));
  return screen.getByRole("dialog", { name: "Create goal" });
};

const dismissals = [
  {
    label: "the Cancel button",
    dismiss: async (user: User) => {
      await user.click(screen.getByRole("button", { name: "Cancel" }));
    },
  },
  {
    label: "the close button",
    dismiss: async (user: User) => {
      await user.click(screen.getByRole("button", { name: "Close" }));
    },
  },
  {
    label: "Escape",
    dismiss: async (user: User) => {
      await user.keyboard("{Escape}");
    },
  },
  {
    label: "the backdrop",
    dismiss: async (user: User) => {
      await user.click(document.body);
    },
  },
];

it.each(dismissals)("discards the draft when dismissed with $label", async ({ dismiss }) => {
  const user = userEvent.setup();
  render(<CreateGoalDialog />);

  await openDialog(user);
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Draft goal");
  await dismiss(user);
  await waitFor(() => {
    expect(screen.queryByRole("dialog", { name: "Create goal" })).not.toBeInTheDocument();
  });

  await openDialog(user);
  expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("");
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
    expect(submittedPayload).toEqual({ goal: { name: "Ship release", description: null } });
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
  server.use(http.post(GOALS_URL, () => HttpResponse.json(goalResponse, { status: 201 })));
  const { router } = render(<CreateGoalDialog />);

  await openDialog(user);
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Ship release");
  await user.click(screen.getByRole("button", { name: "Create goal" }));

  await waitFor(() => {
    expect(router.state.location.pathname).toBe("/goals/goal_created");
  });
});

it("shows API validation errors on the field they belong to", async () => {
  const user = userEvent.setup();
  server.use(
    http.post(GOALS_URL, () =>
      HttpResponse.json({ errors: { name: ["has already been taken"] } }, { status: 422 }),
    ),
  );
  render(<CreateGoalDialog />);

  await openDialog(user);
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Existing goal");
  await user.click(screen.getByRole("button", { name: "Create goal" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("has already been taken");
});
