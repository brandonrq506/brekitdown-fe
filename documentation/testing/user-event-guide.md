# User-Event guidelines

`fireEvent` dispatches DOM events, whereas `user-event` simulates full interactions, which may fire multiple events and do additional checks along the way. `user-event` allows you to describe a user interaction instead of a concrete event. It adds visibility and interactability checks along the way and manipulates the DOM just like a user interaction in the browser would.

## Canonical pattern

Ensure you are invoking `userEvent.setup()` first thing inside the test, and never put in `before`/`after` hooks.
All interactions must be awaited as they are all asynchronous.

Ensure when possibles, that tests follow this sequence:

1. Setup and mock data (if needed)
2. Render component (Here may include any mock props / functions)
3. User interactions
4. Assertions

```tsx
import userEvent from "@testing-library/user-event";

import { render, screen } from "@/test/test-utils";

it("submits the form", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<ExampleForm onSubmit={onSubmit} />);

  await user.type(screen.getByRole("textbox", { name: "Name" }), "Morning");
  await user.click(screen.getByRole("button", { name: "Save" }));

  expect(onSubmit).toHaveBeenCalled();
});
```

Note: Use `fireEvent` only when `user-event` does not support the required interaction, and document the concrete browser event the test needs.

## Choose the API that describes the user's action

- Use `type()` to insert text into an input or textarea.
- Use `keyboard()` for individual keys, shortcuts, held modifiers, and key sequences.
- Use `click()`, `dblClick()`, `hover()`, `unhover()`, and `tab()` for their corresponding pointer and keyboard behavior.
- Use `clear()`, `selectOptions()`, `deselectOptions()` and `upload()` instead of directly changing DOM values or files.
- Establish focus through `click()` or `tab()` before sending keyboard input.

## Target the interface users perceive

Resolve action targets with accessible, user-facing queries. Prefer `screen.getByRole()` with an accessible name, followed by label-based queries for form controls. This keeps the interaction tied to the same interface that keyboard and assistive-technology users receive.

See the [React Testing Library guidelines](./react-testing-library-guide.md) for the
complete query priority, accessibility contract, and asynchronous query rules.

## Preserve realistic defaults

Keep the default visibility, disabled-state, and pointer-events checks. Also preserve the browser-like implicit behavior of the high-level APIs: `click()` moves the pointer to the target first, and `type()` clicks the target before typing.

## Integrate fake timers through `advanceTimers`

When a test uses Vitest fake timers, pass the timer advancement function to the user session:

```tsx
vi.useFakeTimers();
const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
```

Keep `user-event`'s delay behavior intact. Use `advanceTimers` rather than setting `delay: null`, which can change the ordering of asynchronous behavior.

## Use the clipboard stub installed by `setup()`

`userEvent.setup()` installs a `navigator.clipboard` stub for the test document.
Use `user.copy()`, `user.cut()`, and `user.paste()` for user-driven clipboard flows. When application code writes to the clipboard directly, spy on the installed stub after creating the user session:

```tsx
const user = userEvent.setup();
const writeText = vi.spyOn(navigator.clipboard, "writeText");
```
