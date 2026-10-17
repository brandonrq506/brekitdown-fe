import { countOpenTasks } from "../count-open-tasks";
import { TASK_STATUS } from "@/features/tasks/types/task";
import { buildTask } from "@/test/store/tasks";

it("counts tasks per open status and ignores closed ones", () => {
  const tasks = [
    buildTask({ status: TASK_STATUS.SCHEDULED }),
    buildTask({ status: TASK_STATUS.SCHEDULED }),
    buildTask({ status: TASK_STATUS.IN_PROGRESS }),
    buildTask({ status: TASK_STATUS.ON_HOLD }),
    buildTask({ status: TASK_STATUS.COMPLETED }),
    buildTask({ status: TASK_STATUS.DROPPED }),
  ];

  expect(countOpenTasks(tasks)).toEqual({ scheduled: 2, in_progress: 1, on_hold: 1 });
});

it("returns zero counts when there are no tasks", () => {
  expect(countOpenTasks([])).toEqual({ scheduled: 0, in_progress: 0, on_hold: 0 });
});
