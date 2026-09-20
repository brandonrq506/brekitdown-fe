import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { TASK_STATUS, type UpdateTaskPayload } from "../../types/task";
import { TaskCard } from "../task-card";
import { apiRoutes } from "@/test/handlers/api-routes";
import { mockTaskResponse } from "@/test/handlers/tasks";
import { server } from "@/test/server";
import { buildTask, task } from "@/test/store/tasks";
import { render, screen, waitFor } from "@/test/test-utils";

const completed = buildTask({ status: TASK_STATUS.COMPLETED });

/** Collects what reached the wire, so the payload envelope is asserted and not just the label. */
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

type User = ReturnType<typeof userEvent.setup>;

/** Base UI only opens the menu from the keyboard in jsdom, so a click on the trigger is not enough. */
const openStatusMenu = async (user: User, label: string) => {
  screen.getByRole("button", { name: `Status: ${label}` }).focus();
  await user.keyboard("{ArrowDown}");
};

it("offers every status from the card's status icon", async () => {
  const user = userEvent.setup();
  render(<TaskCard task={task} />);

  await openStatusMenu(user, "In progress");

  expect(screen.getAllByRole("menuitemradio")).toHaveLength(5);
  expect(screen.getByRole("menuitemradio", { name: "Scheduled" })).toBeVisible();
  expect(screen.getByRole("menuitemradio", { name: "On hold" })).toBeVisible();
});

it("marks the status the task already has", async () => {
  const user = userEvent.setup();
  render(<TaskCard task={task} />);

  await openStatusMenu(user, "In progress");

  expect(screen.getByRole("menuitemradio", { name: "In progress" })).toBeChecked();
});

it("sends the chosen status as the only change", async () => {
  const user = userEvent.setup();
  const bodies = capturePatches();
  render(<TaskCard task={task} />);

  await openStatusMenu(user, "In progress");

  await user.click(screen.getByRole("menuitemradio", { name: "Completed" }));

  await waitFor(() => {
    expect(bodies).toEqual([{ task: { status: TASK_STATUS.COMPLETED } }]);
  });
});

it("does not resend the status the task already has", async () => {
  const user = userEvent.setup();
  const bodies = capturePatches();
  render(<TaskCard task={completed} />);

  await openStatusMenu(user, "Completed");

  await user.click(screen.getByRole("menuitemradio", { name: "Completed" }));

  expect(bodies).toHaveLength(0);
  expect(screen.getByRole("button", { name: "Status: Completed" })).toBeEnabled();
});

it("disables the status icon while the change is in flight", async () => {
  const user = userEvent.setup();
  let resolveRequest!: () => void;
  const requestGate = new Promise<void>((resolve) => {
    resolveRequest = resolve;
  });
  server.use(
    http.patch(apiRoutes.task(task.reference_xid), async () => {
      await requestGate;

      return mockTaskResponse(completed);
    }),
  );
  render(<TaskCard task={task} />);

  await openStatusMenu(user, "In progress");

  await user.click(screen.getByRole("menuitemradio", { name: "Completed" }));

  expect(screen.getByRole("button", { name: "Status: In progress" })).toBeDisabled();

  resolveRequest();
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Status: In progress" })).toBeEnabled();
  });
});

it("shows a retry message when the change fails", async () => {
  const user = userEvent.setup();
  server.use(
    http.patch(apiRoutes.task(task.reference_xid), () =>
      HttpResponse.json({ errors: { detail: "Temporary failure" } }, { status: 503 }),
    ),
  );
  render(<TaskCard task={task} />);

  await openStatusMenu(user, "In progress");

  await user.click(screen.getByRole("menuitemradio", { name: "Completed" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "We couldn't update the status. Please try again.",
  );
  expect(screen.getByRole("button", { name: "Status: In progress" })).toBeVisible();
});
