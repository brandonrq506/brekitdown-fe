import userEvent from "@testing-library/user-event";

import { render, screen } from "@/test/test-utils";

function SetupProbe() {
  return (
    <>
      <h1>React Testing Library is ready</h1>
      <label>
        Message
        <input type="text" />
      </label>
    </>
  );
}

it("renders a React component and handles user interaction", async () => {
  const user = userEvent.setup();

  render(<SetupProbe />);

  await user.type(screen.getByRole("textbox", { name: "Message" }), "Hello");

  expect(
    screen.getByRole("heading", { name: "React Testing Library is ready" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Message" })).toHaveValue("Hello");
});
