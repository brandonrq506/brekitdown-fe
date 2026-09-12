import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { useDeleteTaskMutation } from "./deleteTaskMutation";
import { api, TASKS_ENDPOINT } from "@/libs/axios";
import { server } from "@/test/server";
import { render, screen } from "@/test/test-utils";

const TASK_REFERENCE_XID = "task_01";
const TASK_URL = `${api.defaults.baseURL}${TASKS_ENDPOINT}/${TASK_REFERENCE_XID}`;

const DeleteTaskProbe = () => {
  const deleteTask = useDeleteTaskMutation();

  return (
    <>
      <button
        type="button"
        disabled={deleteTask.isPending}
        onClick={() => deleteTask.mutate(TASK_REFERENCE_XID)}
      >
        Delete task
      </button>
      {deleteTask.isSuccess && <p role="status">Task deleted</p>}
      {deleteTask.isError && <p role="alert">Task deletion failed</p>}
    </>
  );
};

it("treats a 204 response from the task endpoint as a successful deletion", async () => {
  const user = userEvent.setup();
  server.use(http.delete(TASK_URL, () => new HttpResponse(null, { status: 204 })));
  render(<DeleteTaskProbe />);

  await user.click(screen.getByRole("button", { name: "Delete task" }));

  expect(await screen.findByRole("status")).toHaveTextContent("Task deleted");
});

it("reports a failed deletion", async () => {
  const user = userEvent.setup();
  server.use(
    http.delete(TASK_URL, () =>
      HttpResponse.json({ errors: { detail: "Temporary failure" } }, { status: 503 }),
    ),
  );
  render(<DeleteTaskProbe />);

  await user.click(screen.getByRole("button", { name: "Delete task" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Task deletion failed");
});
