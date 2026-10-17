import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";

import { TASK_STATUS, type UpdateTaskPayload } from "../../types/task";
import { TaskCard } from "../task-card";
import { apiRoutes } from "@/test/handlers/api-routes";
import { mockTaskResponse } from "@/test/handlers/tasks";
import { server } from "@/test/server";
import { buildTask } from "@/test/store/tasks";
import { render, screen, waitFor } from "@/test/test-utils";

const dropped = buildTask({ status: TASK_STATUS.DROPPED });

const goalCompletedConflict = () =>
  HttpResponse.json(
    { errors: { code: "goal_completed", detail: "This goal is completed." } },
    { status: 409 },
  );

afterEach(() => server.events.removeAllListeners());

/** The first PATCH is refused because the goal is completed; any retry goes through. */
const refuseFirstPatch = () => {
  const patches: UpdateTaskPayload[] = [];
  const reopened = vi.fn();
  // The baseline handler answers the reopen; this only records that it was asked.
  server.events.on("request:start", ({ request }) => {
    if (request.url === apiRoutes.goalReopen(dropped.goal?.reference_xid)) reopened();
  });
  server.use(
    http.patch<never, UpdateTaskPayload>(
      apiRoutes.task(dropped.reference_xid),
      async ({ request }) => {
        const body = await request.json();
        patches.push(body);

        return patches.length === 1
          ? goalCompletedConflict()
          : mockTaskResponse({ ...dropped, ...body.task });
      },
    ),
  );

  return { patches, reopened };
};

const moveToScheduled = async (user: ReturnType<typeof userEvent.setup>) => {
  render(
    <TaskCard.Root task={dropped}>
      <TaskCard.Header>
        <TaskCard.Status />
      </TaskCard.Header>
    </TaskCard.Root>,
  );
  screen.getByRole("button", { name: "Status: Dropped" }).focus();
  await user.keyboard("{ArrowDown}");
  await user.click(screen.getByRole("menuitemradio", { name: "Scheduled" }));
};

it("asks to reopen the goal when the API refuses because the goal is completed", async () => {
  const user = userEvent.setup();
  refuseFirstPatch();

  await moveToScheduled(user);

  const dialog = await screen.findByRole("dialog", { name: "Reopen this goal?" });
  expect(dialog).toHaveTextContent("Continuing will remove its completed status.");
});

it("reopens the goal and retries the status change on confirm", async () => {
  const user = userEvent.setup();
  const { patches, reopened } = refuseFirstPatch();

  await moveToScheduled(user);
  await user.click(await screen.findByRole("button", { name: "Reopen and continue" }));

  await waitFor(() => expect(patches).toHaveLength(2));
  expect(reopened).toHaveBeenCalledOnce();
  expect(patches[1]).toEqual({ task: { status: TASK_STATUS.SCHEDULED } });
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});

it("leaves everything unchanged when the dialog is cancelled", async () => {
  const user = userEvent.setup();
  const { patches, reopened } = refuseFirstPatch();

  await moveToScheduled(user);
  await user.click(await screen.findByRole("button", { name: "Cancel" }));

  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(reopened).not.toHaveBeenCalled();
  expect(patches).toHaveLength(1);
});
