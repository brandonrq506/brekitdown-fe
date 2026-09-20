import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { TaskCard } from "../task-card";
import type { UpdateTaskPayload } from "../../types/task";
import { endOfLocalDay } from "../../utils/task-due-date";
import { apiRoutes } from "@/test/handlers/api-routes";
import { mockTaskResponse } from "@/test/handlers/tasks";
import { server } from "@/test/server";
import { buildTask, task } from "@/test/store/tasks";
import { render, screen, waitFor } from "@/test/test-utils";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const undated = buildTask({ due_at: null });
const dueTomorrow = buildTask({ due_at: endOfLocalDay(tomorrow).toISOString() });

const monthAndYear = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
  tomorrow,
);

const dayButtonName = new RegExp(
  new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", weekday: "long" })
    .format(tomorrow)
    .replace(",", ",?"),
  "i",
);

/** Collects what reached the wire, so the timezone contract is asserted and not just the label. */
const capturePatches = () => {
  const bodies: UpdateTaskPayload[] = [];

  server.use(
    http.patch<never, UpdateTaskPayload>(
      apiRoutes.task(task.reference_xid),
      async ({ request }) => {
        const body = await request.json();
        bodies.push(body);

        return mockTaskResponse({ ...task, ...body.task });
      },
    ),
  );

  return bodies;
};

it("opens a calendar from the card's due date", async () => {
  const user = userEvent.setup();
  render(<TaskCard task={dueTomorrow} />);

  await user.click(screen.getByRole("button", { name: "Change due date" }));

  expect(screen.getByRole("grid", { name: monthAndYear })).toBeVisible();
});

it("offers to set a due date when the task has none", () => {
  render(<TaskCard task={undated} />);

  expect(screen.getByRole("button", { name: "Set due date" })).toBeVisible();
  expect(screen.getByText("No due date")).toBeVisible();
});

it("saves the chosen day as the end of that day in the browser's timezone", async () => {
  const user = userEvent.setup();
  const bodies = capturePatches();
  render(<TaskCard task={undated} />);

  await user.click(screen.getByRole("button", { name: "Set due date" }));

  await user.click(screen.getByRole("button", { name: dayButtonName }));

  await waitFor(() => {
    expect(bodies).toEqual([{ task: { due_at: endOfLocalDay(tomorrow).toISOString() } }]);
  });
});

it("clears the due date", async () => {
  const user = userEvent.setup();
  const bodies = capturePatches();
  render(<TaskCard task={dueTomorrow} />);

  await user.click(screen.getByRole("button", { name: "Change due date" }));

  await user.click(screen.getByRole("button", { name: "Remove" }));

  await waitFor(() => {
    expect(bodies).toEqual([{ task: { due_at: null } }]);
  });
});

// Re-picking the selected day deselects it in the calendar, which the popover swallows.
it("does not resend the day the task is already due", async () => {
  const user = userEvent.setup();
  const bodies = capturePatches();
  render(<TaskCard task={dueTomorrow} />);

  await user.click(screen.getByRole("button", { name: "Change due date" }));

  await user.click(screen.getByRole("button", { name: dayButtonName }));

  expect(bodies).toHaveLength(0);
  expect(screen.getByRole("button", { name: "Change due date" })).toBeEnabled();
});

it("disables the due date while the change is in flight", async () => {
  const user = userEvent.setup();
  let resolveRequest!: () => void;
  const requestGate = new Promise<void>((resolve) => {
    resolveRequest = resolve;
  });
  server.use(
    http.patch(apiRoutes.task(task.reference_xid), async () => {
      await requestGate;

      return mockTaskResponse(dueTomorrow);
    }),
  );
  render(<TaskCard task={undated} />);

  await user.click(screen.getByRole("button", { name: "Set due date" }));

  await user.click(screen.getByRole("button", { name: dayButtonName }));

  expect(screen.getByRole("button", { name: "Set due date" })).toBeDisabled();

  resolveRequest();
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Set due date" })).toBeEnabled();
  });
});

it("shows a retry message when the change fails", async () => {
  const user = userEvent.setup();
  server.use(
    http.patch(apiRoutes.task(task.reference_xid), () =>
      HttpResponse.json({ errors: { detail: "Temporary failure" } }, { status: 503 }),
    ),
  );
  render(<TaskCard task={undated} />);

  await user.click(screen.getByRole("button", { name: "Set due date" }));

  await user.click(screen.getByRole("button", { name: dayButtonName }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "We couldn't update the due date. Please try again.",
  );
  expect(screen.getByText("No due date")).toBeVisible();
});
