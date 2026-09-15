import { TaskCard } from "../task-card";
import { TASK_STATUS } from "../../types/task";
import { buildTask } from "@/test/store/tasks";
import { endedTimeEntry, runningTimeEntry } from "@/test/store/time-entries";
import { render, screen } from "@/test/test-utils";

it.each([TASK_STATUS.SCHEDULED, TASK_STATUS.IN_PROGRESS, TASK_STATUS.DROPPED, TASK_STATUS.ON_HOLD])(
  "offers Start on a task with the %s status",
  (status) => {
    render(<TaskCard task={buildTask({ status })} />);

    expect(screen.getByRole("button", { name: "Start" })).toBeVisible();
  },
);

it("offers Start when every time entry of the task has ended", () => {
  render(<TaskCard task={buildTask({ time_entries: [endedTimeEntry] })} />);

  expect(screen.getByRole("button", { name: "Start" })).toBeVisible();
});

it("offers Stop when the task has a running time entry", () => {
  render(<TaskCard task={buildTask({ time_entries: [endedTimeEntry, runningTimeEntry] })} />);

  expect(screen.getByRole("button", { name: "Stop" })).toBeVisible();
});

it("offers no timer action on a completed task", () => {
  render(<TaskCard task={buildTask({ status: TASK_STATUS.COMPLETED })} />);

  expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Stop" })).not.toBeInTheDocument();
});

it("offers no timer action on a task with subtasks", () => {
  render(<TaskCard task={buildTask({ has_children: true, time_entries: [runningTimeEntry] })} />);

  expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Stop" })).not.toBeInTheDocument();
});
