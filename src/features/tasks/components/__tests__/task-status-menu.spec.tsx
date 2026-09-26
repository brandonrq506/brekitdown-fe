import userEvent from "@testing-library/user-event";

import { TASK_STATUS } from "../../types/task";
import { TaskStatusMenu } from "../task-status-menu";
import { render, screen } from "@/test/test-utils";

type User = ReturnType<typeof userEvent.setup>;

const renderMenu = (value: TASK_STATUS, onValueChange = vi.fn()) => {
  render(
    <TaskStatusMenu
      value={value}
      onValueChange={onValueChange}
      trigger={<button type="button" aria-label="Status" />}>
      icon
    </TaskStatusMenu>,
  );

  return onValueChange;
};

/** Base UI only opens the menu from the keyboard in jsdom, so a click on the trigger is not enough. */
const openMenu = async (user: User) => {
  screen.getByRole("button", { name: "Status" }).focus();
  await user.keyboard("{ArrowDown}");
};

it("offers every status", async () => {
  const user = userEvent.setup();
  renderMenu(TASK_STATUS.IN_PROGRESS);

  await openMenu(user);

  expect(screen.getAllByRole("menuitemradio")).toHaveLength(5);
  expect(screen.getByRole("menuitemradio", { name: "Scheduled" })).toBeVisible();
  expect(screen.getByRole("menuitemradio", { name: "On hold" })).toBeVisible();
});

it("marks the current status", async () => {
  const user = userEvent.setup();
  renderMenu(TASK_STATUS.IN_PROGRESS);

  await openMenu(user);

  expect(screen.getByRole("menuitemradio", { name: "In progress" })).toBeChecked();
});

it("reports the chosen status once", async () => {
  const user = userEvent.setup();
  const onValueChange = renderMenu(TASK_STATUS.IN_PROGRESS);

  await openMenu(user);
  await user.click(screen.getByRole("menuitemradio", { name: "Completed" }));

  expect(onValueChange).toHaveBeenCalledOnce();
  expect(onValueChange).toHaveBeenCalledWith(TASK_STATUS.COMPLETED);
});

it("does not report the current status", async () => {
  const user = userEvent.setup();
  const onValueChange = renderMenu(TASK_STATUS.COMPLETED);

  await openMenu(user);
  await user.click(screen.getByRole("menuitemradio", { name: "Completed" }));

  expect(onValueChange).not.toHaveBeenCalled();
});
