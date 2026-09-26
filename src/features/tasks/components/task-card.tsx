import type { Task } from "../types/task";
import { TaskCard as Parts } from "./task-card/index";

interface Props {
  task: Task;
}

/** Migration shim: the goal page's composition until Stage 7 composes it explicitly. */
export const TaskCard = ({ task }: Props) => (
  <Parts.Root task={task}>
    <Parts.Header>
      <Parts.Status />
      <Parts.Title />
      <Parts.Actions>
        <Parts.Timer />
        <Parts.Menu />
      </Parts.Actions>
    </Parts.Header>
    <Parts.Description />
    <Parts.Footer>
      <Parts.Created />
      <Parts.DueDate />
      <Parts.Notes />
    </Parts.Footer>
  </Parts.Root>
);
