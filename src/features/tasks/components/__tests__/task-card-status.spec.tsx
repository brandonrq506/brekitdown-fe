import userEvent from "@testing-library/user-event";
import { http } from "msw";

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
