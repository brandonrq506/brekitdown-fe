import { useState } from "react";
import userEvent from "@testing-library/user-event";

import { render, screen, within } from "@/test/test-utils";
import { CreateDialog } from "../create-dialog";

const TestDialog = ({ pending = false }: { pending?: boolean }) => {
  const [open, setOpen] = useState(false);

  return (
    <CreateDialog
      open={open}
      onOpenChange={setOpen}
      pending={pending}
      triggerLabel="Create item"
      title="Create item"
      description="Describe the new item.">
      <div>Dialog body</div>
    </CreateDialog>
  );
};

const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Create item" }));

  return screen.findByRole("dialog", { name: "Create item" });
};

it("provides accessible hidden context", async () => {
  const user = userEvent.setup();
  render(<TestDialog />);

  const dialog = await openDialog(user);
  const heading = within(dialog).getByRole("heading", { name: "Create item" });

  expect(heading.parentElement).toHaveClass("sr-only");
  expect(dialog).toHaveAccessibleDescription("Describe the new item.");
  expect(dialog).toHaveClass("max-h-[calc(100dvh-2rem)]", "overflow-y-auto", "sm:max-w-xl");
});

it("allows keyboard dismissal", async () => {
  const user = userEvent.setup();
  render(<TestDialog />);

  await openDialog(user);
  await user.keyboard("{Escape}");

  expect(screen.queryByRole("dialog", { name: "Create item" })).not.toBeInTheDocument();
});

it("blocks dismissal while pending", async () => {
  const user = userEvent.setup();
  render(<TestDialog pending />);

  await openDialog(user);

  await user.keyboard("{Escape}");
  await user.click(document.body);

  expect(screen.getByRole("dialog", { name: "Create item" })).toBeVisible();
});
