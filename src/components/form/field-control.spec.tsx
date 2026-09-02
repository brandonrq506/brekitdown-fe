import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { InputField, TextareaField } from "./field-control";
import { render, screen } from "@/test/test-utils";

it("connects an input label, descriptions, and error", () => {
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

  const name = screen.getByRole("textbox", { name: "Name" });
  expect(name).toHaveAccessibleDescription(
    "This hint comes from the feature. Use a recognizable name. Name is unavailable.",
  );
  expect(name).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByRole("alert")).toHaveTextContent("Name is unavailable.");
});

it("connects a textarea label and description", () => {
  render(<TextareaField label="Notes" description="Optional context." />);

  expect(screen.getByRole("textbox", { name: "Notes" })).toHaveAccessibleDescription(
    "Optional context.",
  );
});

it("forwards native input props and ref to the rendered control", async () => {
  const user = userEvent.setup();
  const inputRef = createRef<HTMLInputElement>();
  const onChange = vi.fn();

  render(<InputField ref={inputRef} name="goalName" label="Name" onChange={onChange} />);

  const name = screen.getByRole("textbox", { name: "Name" });
  await user.type(name, "Plan a trip");

  expect(name).toHaveAttribute("name", "goalName");
  expect(inputRef.current).toBe(name);
  expect(onChange).toHaveBeenCalled();
});
