import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { InputField, TextareaField } from "../field-control";
import { render, screen } from "@/test/test-utils";

it("composes the input description from every hint the field is given", () => {
  render(
    <div>
      <p id="name-hint">This hint comes from the feature.</p>
      <InputField
        label="Name"
        description="Use a recognizable name."
        error="Name is unavailable."
        aria-describedby="name-hint"
      />
    </div>,
  );

  const nameField = screen.getByRole("textbox", { name: "Name" });
  const expectedAccessibleDescription =
    "This hint comes from the feature. Use a recognizable name. Name is unavailable.";

  expect(nameField).toHaveAccessibleDescription(expectedAccessibleDescription);
});

it("marks the input invalid while it carries an error", () => {
  render(<InputField label="Name" error="Name is unavailable." />);

  expect(screen.getByRole("textbox", { name: "Name" })).toBeInvalid();
});

it("announces the input error", () => {
  render(<InputField label="Name" error="Name is unavailable." />);

  expect(screen.getByRole("alert")).toHaveTextContent("Name is unavailable.");
});

it("describes the textarea with its description", () => {
  render(<TextareaField label="Notes" description="Optional context." />);

  expect(screen.getByRole("textbox", { name: "Notes" })).toHaveAccessibleDescription(
    "Optional context.",
  );
});

it("gives the control the form name the caller supplied", () => {
  render(<InputField name="goalName" label="Name" />);

  expect(screen.getByRole("textbox", { name: "Name" })).toHaveAttribute("name", "goalName");
});

it("notifies the caller while the user types", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<InputField label="Name" onChange={onChange} />);

  const nameField = screen.getByRole("textbox", { name: "Name" });
  await user.type(nameField, "Plan a trip");

  expect(onChange).toHaveBeenCalled();
});

it("points the caller's ref at the rendered control", () => {
  const inputRef = createRef<HTMLInputElement>();
  render(<InputField ref={inputRef} label="Name" />);

  expect(inputRef.current).toBe(screen.getByRole("textbox", { name: "Name" }));
});
