import userEvent from "@testing-library/user-event";
import { http } from "msw";

import { TaskCardStartBtn } from "../task-card-start-btn";
import { apiRoutes } from "@/test/handlers/api-routes";
import { mockGoalCompletedConflict } from "@/test/handlers/goals";
import { timeEntryResponse } from "@/test/handlers/time-entries";
import { server } from "@/test/server";
import { task } from "@/test/store/tasks";
import { runningTimeEntry } from "@/test/store/time-entries";
import { render, screen, waitFor } from "@/test/test-utils";

afterEach(() => server.events.removeAllListeners());

/** The first start is refused because the goal is completed; any retry goes through. */
const refuseFirstStart = () => {
  const requests = { starts: 0, reopens: 0 };
  server.events.on("request:start", ({ request }) => {
    if (request.url === apiRoutes.goalReopen(task.goal?.reference_xid)) requests.reopens += 1;
  });
  server.use(
    http.post(apiRoutes.timeEntries(task.reference_xid), () => {
      requests.starts += 1;

      return requests.starts === 1
        ? mockGoalCompletedConflict()
        : timeEntryResponse(runningTimeEntry, { status: 201 });
    }),
  );

  return requests;
};

it("asks to reopen the goal when starting is refused", async () => {
  const user = userEvent.setup();
  refuseFirstStart();
  render(<TaskCardStartBtn task={task} />);

  await user.click(screen.getByRole("button", { name: "Start" }));

  const dialog = await screen.findByRole("dialog", { name: "Reopen this goal?" });
  expect(dialog).toHaveTextContent("Continuing will remove its completed status.");
});

it("reopens the goal and starts the timer on confirm", async () => {
  const user = userEvent.setup();
  const requests = refuseFirstStart();
  render(<TaskCardStartBtn task={task} />);

  await user.click(screen.getByRole("button", { name: "Start" }));
  await user.click(await screen.findByRole("button", { name: "Reopen and continue" }));

  await waitFor(() => expect(requests).toEqual({ starts: 2, reopens: 1 }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});

it("starts nothing when the reopen is cancelled", async () => {
  const user = userEvent.setup();
  const requests = refuseFirstStart();
  render(<TaskCardStartBtn task={task} />);

  await user.click(screen.getByRole("button", { name: "Start" }));
  await user.click(await screen.findByRole("button", { name: "Cancel" }));

  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(requests).toEqual({ starts: 1, reopens: 0 });
});
