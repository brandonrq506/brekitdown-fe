import { render, screen } from "@/test/test-utils";

function SetupProbe() {
  return <h1>React Testing Library is ready</h1>;
}

it("renders a React component", () => {
  render(<SetupProbe />);

  expect(screen.getByRole("heading", { name: "React Testing Library is ready" })).toBeTruthy();
});
