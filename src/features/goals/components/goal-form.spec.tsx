import userEvent from "@testing-library/user-event";

import { GoalForm } from "./goal-form";
import type { GoalFormValues } from "../types/goal";
import { render, screen, waitFor } from "@/test/test-utils";

const FORM_ERROR_MESSAGE = "We couldn't save your goal. Please try again.";

const noop = () => {};

const renderForm = (onSubmit: (values: GoalFormValues) => Promise<void>, onCancel = noop) =>
  render(
    <GoalForm
      defaultValues={{ name: "", description: "" }}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel="Save goal"
      pendingLabel="Saving…"
      formErrorMessage={FORM_ERROR_MESSAGE}
    />,
  );

const typeName = async (user: ReturnType<typeof userEvent.setup>, name: string) => {
  await user.type(screen.getByRole("textbox", { name: "Name" }), name);
};

const submit = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Save goal" }));
};

it("shows a required error when submitted without a name", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn(() => Promise.resolve());
  renderForm(onSubmit);

  await submit(user);

  expect(await screen.findByRole("alert")).toHaveTextContent("Goal name is required.");
  expect(onSubmit).not.toHaveBeenCalled();
});

it("treats a whitespace-only name as empty", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn(() => Promise.resolve());
  renderForm(onSubmit);

  await typeName(user, "   ");
  await submit(user);

  expect(await screen.findByRole("alert")).toHaveTextContent("Goal name is required.");
  expect(onSubmit).not.toHaveBeenCalled();
});

it("hands the entered values to the caller", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn(() => Promise.resolve());
  renderForm(onSubmit);

  await typeName(user, "  Ship release  ");
  await user.type(screen.getByRole("textbox", { name: "Description" }), "Context");
  await submit(user);

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({ name: "Ship release", description: "Context" });
  });
});

it("locks the actions while the submission is in flight", async () => {
  const user = userEvent.setup();
  let releaseSubmit!: () => void;
  const onSubmit = () =>
    new Promise<void>((resolve) => {
      releaseSubmit = resolve;
    });
  renderForm(onSubmit);

  await typeName(user, "Ship release");
  await submit(user);

  expect(await screen.findByRole("button", { name: "Saving…" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

  releaseSubmit();

  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Save goal" })).toBeEnabled();
  });
});

it("keeps the entered values and shows the form message when the submission fails", async () => {
  const user = userEvent.setup();
  const onSubmit = () => Promise.reject(new Error("Network down"));
  renderForm(onSubmit);

  await typeName(user, "Keep this value");
  await submit(user);

  expect(await screen.findByRole("alert")).toHaveTextContent(FORM_ERROR_MESSAGE);
  expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Keep this value");
});

it("cancels without submitting", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn(() => Promise.resolve());
  const onCancel = vi.fn();
  renderForm(onSubmit, onCancel);

  await typeName(user, "Ship release");
  await user.click(screen.getByRole("button", { name: "Cancel" }));

  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onSubmit).not.toHaveBeenCalled();
});
