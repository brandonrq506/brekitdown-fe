import { TaskCard } from "../task-card";
import { TASK_STATUS, type Task, type TASK_STATUS as TaskStatus } from "../../types/task";
import { buildTask } from "@/test/store/tasks";
import { buildTimeEntry, runningTimeEntry } from "@/test/store/time-entries";
import { render, screen } from "@/test/test-utils";

const StatusDetailsCard = ({ task }: { task: Task }) => (
  <TaskCard.Root task={task}>
    <TaskCard.Title />
    <TaskCard.Footer>
      <TaskCard.StatusDetails />
    </TaskCard.Footer>
  </TaskCard.Root>
);

const anHourLogged = buildTimeEntry({
  started_at: "2026-09-12T09:00:00Z",
  ended_at: "2026-09-12T10:00:00Z",
});

const withStatus = (status: TaskStatus) =>
  buildTask({ status, time_entries: [anHourLogged, runningTimeEntry] });

const card = (task: Task) => screen.getByRole("article", { name: task.name });

describe.each<[status: TaskStatus, facts: RegExp[], omitted: RegExp[]]>([
  [TASK_STATUS.SCHEDULED, [/Created/, /Due/], [/Time spent/]],
  [TASK_STATUS.IN_PROGRESS, [/Created/, /Due/, /Time spent\s*1h/], []],
  [TASK_STATUS.ON_HOLD, [/Created/, /Due/], [/Time spent/]],
  [TASK_STATUS.COMPLETED, [/Time spent\s*1h/], [/Created/, /Due/]],
  [TASK_STATUS.DROPPED, [/Created/], [/Due/, /Time spent/]],
])("a %s task", (status, facts, omitted) => {
  it.each(facts)("shows %s", (fact) => {
    const task = withStatus(status);
    render(<StatusDetailsCard task={task} />);

    expect(card(task)).toHaveTextContent(fact);
  });

  it.each(omitted)("hides %s", (fact) => {
    const task = withStatus(status);
    render(<StatusDetailsCard task={task} />);

    expect(card(task)).not.toHaveTextContent(fact);
  });
});

it("skips time spent while nothing has been logged", () => {
  const task = buildTask({ status: TASK_STATUS.COMPLETED, time_entries: [runningTimeEntry] });
  render(<StatusDetailsCard task={task} />);

  expect(card(task)).not.toHaveTextContent(/Time spent/);
});
