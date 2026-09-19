import userEvent from "@testing-library/user-event";

import { goal } from "@/test/store/goals";
import { render, screen, within } from "@/test/test-utils";
import { CreateTaskDialog } from "../create-task-dialog";

type User = ReturnType<typeof userEvent.setup>;

const calendarMonth = new Date();
const selectedDate = new Date();
selectedDate.setDate(selectedDate.getDate() + 1);
const monthAndYear = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
}).format(calendarMonth);
const dayButtonName = new RegExp(
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    weekday: "long",
  })
    .format(selectedDate)
    .replace(",", ",?"),
  "i",
);

const openDialog = async (user: User) => {
  await user.click(screen.getByRole("button", { name: "Create task" }));

  return screen.findByRole("dialog", { name: "Create task" });
};

it("shows a calendar for selecting the due date", async () => {
  const user = userEvent.setup();
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);
  const dialog = await openDialog(user);

  await user.click(within(dialog).getByRole("button", { name: "Set due date" }));

  expect(screen.getByRole("grid", { name: monthAndYear })).toBeVisible();
});

it("shows the chosen due date on the task draft", async () => {
  const user = userEvent.setup();
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);
  const dialog = await openDialog(user);

  await user.click(within(dialog).getByRole("button", { name: "Set due date" }));

  await user.click(screen.getByRole("button", { name: dayButtonName }));

  expect(within(dialog).getByText("tomorrow")).toBeVisible();
});

it("removes a selected due date", async () => {
  const user = userEvent.setup();
  render(<CreateTaskDialog goalReferenceXid={goal.reference_xid} />);
  const dialog = await openDialog(user);

  await user.click(within(dialog).getByRole("button", { name: "Set due date" }));

  await user.click(screen.getByRole("button", { name: dayButtonName }));

  await user.click(within(dialog).getByRole("button", { name: "Change due date" }));

  await user.click(screen.getByRole("button", { name: "Remove" }));

  expect(within(dialog).getByRole("button", { name: "Set due date" })).toBeVisible();
});
