import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import type { TaskNote, TaskNotesResponse } from "../../types/task-note";
import { TaskCard } from "@/features/tasks/components/task-card";
import { apiRoutes } from "@/test/handlers/api-routes";
import { server } from "@/test/server";
import { buildTask, task } from "@/test/store/tasks";
import { render, screen, within } from "@/test/test-utils";

const NOTES_LIST_NAME = "Task notes, newest first";

const newestNote: TaskNote = {
  reference_xid: "note_02",
  title: "Where I left off",
  body: "The first step is done. Next: check the remaining details.",
  inserted_at: "2026-09-18T12:00:00Z",
  updated_at: "2026-09-18T12:00:00Z",
};

const olderNote: TaskNote = {
  ...newestNote,
  reference_xid: "note_01",
  title: "Earlier plan",
  body: "Start by splitting the read.",
};

const mockNotesResponse = (data: TaskNote[]) => HttpResponse.json<TaskNotesResponse>({ data });

/** The trigger's accessible name carries the note count, so every test spells it the same way. */
const notesTrigger = (forTask = task) =>
  screen.getByRole("button", { name: `Notes for ${forTask.name} (${forTask.notes_count})` });

it("offers the notes without showing them until the user expands them", () => {
  render(<TaskCard task={task} />);

  expect(notesTrigger()).toBeVisible();
  expect(screen.queryByRole("list", { name: NOTES_LIST_NAME })).not.toBeInTheDocument();
});

it("lists the task's notes newest first when the user expands them", async () => {
  const user = userEvent.setup();
  server.use(
    http.get(apiRoutes.taskNotes(task.reference_xid), () =>
      mockNotesResponse([newestNote, olderNote]),
    ),
  );
  render(<TaskCard task={task} />);

  await user.click(notesTrigger());

  const notesList = await screen.findByRole("list", { name: NOTES_LIST_NAME });
  const noteTitles = within(notesList)
    .getAllByRole("heading")
    .map((heading) => heading.textContent);

  expect(noteTitles).toEqual([newestNote.title, olderNote.title]);
});

it("opens the newest note so the user can read it straight away", async () => {
  const user = userEvent.setup();
  server.use(
    http.get(apiRoutes.taskNotes(task.reference_xid), () =>
      mockNotesResponse([newestNote, olderNote]),
    ),
  );
  render(<TaskCard task={task} />);

  await user.click(notesTrigger());

  expect(await screen.findByText(newestNote.body)).toBeVisible();
  expect(screen.queryByText(olderNote.body)).not.toBeInTheDocument();
});

it("reveals an older note's body when the user opens it", async () => {
  const user = userEvent.setup();
  server.use(
    http.get(apiRoutes.taskNotes(task.reference_xid), () =>
      mockNotesResponse([newestNote, olderNote]),
    ),
  );
  render(<TaskCard task={task} />);

  await user.click(notesTrigger());

  const olderNoteTrigger = await screen.findByRole("button", { name: olderNote.title });
  await user.click(olderNoteTrigger);

  expect(screen.getByText(olderNote.body)).toBeVisible();
});

it("tells the user the notes are on their way", async () => {
  const user = userEvent.setup();
  let resolveRequest!: () => void;
  const requestGate = new Promise<void>((resolve) => {
    resolveRequest = resolve;
  });
  server.use(
    http.get(apiRoutes.taskNotes(task.reference_xid), async () => {
      await requestGate;

      return mockNotesResponse([newestNote]);
    }),
  );
  render(<TaskCard task={task} />);

  await user.click(notesTrigger());

  expect(await screen.findByRole("status")).toHaveTextContent("Loading notes…");

  resolveRequest();
  await screen.findByRole("heading", { name: newestNote.title });
});

it("tells the user a task has no notes yet", async () => {
  const user = userEvent.setup();
  const taskWithoutNotes = buildTask({ notes_count: 0 });
  server.use(
    http.get(apiRoutes.taskNotes(taskWithoutNotes.reference_xid), () => mockNotesResponse([])),
  );
  render(<TaskCard task={taskWithoutNotes} />);

  await user.click(notesTrigger(taskWithoutNotes));

  expect(await screen.findByText("No notes for this task yet.")).toBeVisible();
});

it("tells the user when the notes cannot be loaded", async () => {
  const user = userEvent.setup();
  server.use(
    http.get(
      apiRoutes.taskNotes(task.reference_xid),
      () => new HttpResponse(null, { status: 503 }),
    ),
  );
  render(<TaskCard task={task} />);

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
  render(<TaskCard task={task} />);
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
  render(<TaskCard task={task} />);
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

it("shows each task the notes that belong to it", async () => {
  const user = userEvent.setup();
  const otherTask = buildTask({ reference_xid: "task_02", name: "Plan the retrospective" });
  const otherNote: TaskNote = { ...newestNote, reference_xid: "note_03", title: "Booked the room" };
  server.use(
    http.get(apiRoutes.taskNotes(task.reference_xid), () => mockNotesResponse([newestNote])),
    http.get(apiRoutes.taskNotes(otherTask.reference_xid), () => mockNotesResponse([otherNote])),
  );
  render(
    <>
      <TaskCard task={task} />
      <TaskCard task={otherTask} />
    </>,
  );
  await user.click(notesTrigger());

  await user.click(notesTrigger(otherTask));

  const otherCard = screen.getByRole("article", { name: otherTask.name });

  expect(await within(otherCard).findByRole("heading", { name: otherNote.title })).toBeVisible();
  expect(within(otherCard).queryByText(newestNote.title)).not.toBeInTheDocument();
});
