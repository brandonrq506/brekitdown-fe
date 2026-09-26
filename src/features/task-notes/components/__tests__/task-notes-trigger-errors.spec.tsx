import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import type { TaskNote, TaskNotesResponse } from "../../types/task-note";
import { TaskCard } from "@/features/tasks/components/task-card";
import type { Task } from "@/features/tasks/types/task";
import { apiRoutes } from "@/test/handlers/api-routes";
import { server } from "@/test/server";
import { task } from "@/test/store/tasks";
import { render, screen } from "@/test/test-utils";

const NotesCard = ({ task }: { task: Task }) => (
  <TaskCard.Root task={task}>
    <TaskCard.Title />
    <TaskCard.Footer>
      <TaskCard.Notes />
    </TaskCard.Footer>
  </TaskCard.Root>
);

const newestNote: TaskNote = {
  reference_xid: "note_02",
  title: "Where I left off",
  body: "The first step is done. Next: check the remaining details.",
  inserted_at: "2026-09-18T12:00:00Z",
  updated_at: "2026-09-18T12:00:00Z",
};

const mockNotesResponse = (data: TaskNote[]) => HttpResponse.json<TaskNotesResponse>({ data });

const notesTrigger = () =>
  screen.getByRole("button", { name: `Notes for ${task.name} (${task.notes_count})` });

it("tells the user when the notes cannot be loaded", async () => {
  const user = userEvent.setup();
  server.use(
    http.get(
      apiRoutes.taskNotes(task.reference_xid),
      () => new HttpResponse(null, { status: 503 }),
    ),
  );
  render(<NotesCard task={task} />);

  await user.click(notesTrigger());

  expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't load your notes.");
});

it("shows the notes when the user tries again after a failed load", async () => {
  const user = userEvent.setup();
  server.use(
    http.get(
      apiRoutes.taskNotes(task.reference_xid),
      () => new HttpResponse(null, { status: 503 }),
    ),
  );
  render(<NotesCard task={task} />);
  await user.click(notesTrigger());
  await screen.findByRole("alert");

  server.use(
    http.get(apiRoutes.taskNotes(task.reference_xid), () => mockNotesResponse([newestNote])),
  );
  await user.click(screen.getByRole("button", { name: "Try again" }));

  expect(await screen.findByRole("heading", { name: newestNote.title })).toBeVisible();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("keeps the saved notes on screen when a later refresh fails", async () => {
  const user = userEvent.setup();
  server.use(
    http.get(apiRoutes.taskNotes(task.reference_xid), () => mockNotesResponse([newestNote]), {
      once: true,
    }),
    http.get(
      apiRoutes.taskNotes(task.reference_xid),
      () => new HttpResponse(null, { status: 503 }),
    ),
  );
  render(<NotesCard task={task} />);
  await user.click(notesTrigger());
  await screen.findByRole("heading", { name: newestNote.title });

  // Collapsing unmounts the list, so reopening it is what asks the server for the notes again.
  await user.click(notesTrigger());

  await user.click(notesTrigger());

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "We couldn't refresh your notes. Showing the saved notes.",
  );
  expect(screen.getByRole("heading", { name: newestNote.title })).toBeVisible();
});
