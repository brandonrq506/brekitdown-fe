# React Testing Library guidelines

Write tests against the DOM and accessibility interfaces that users receive. Describe
what a user can find, do, and observe rather than component instances, private state,
hook calls, or DOM implementation details.

## Canonical pattern

Import React Testing Library APIs from `@/test/test-utils`, not directly from
`@testing-library/react`. The custom `render` supplies the application's standard
test providers, including a fresh React Query client for every render.

Create the `user-event` session inside the test, render inside the test, await every
interaction, and assert the user-observable result.

```tsx
import userEvent from "@testing-library/user-event";

import { render, screen } from "@/test/test-utils";

it("saves the profile", async () => {
  const user = userEvent.setup();

  render(<ProfileForm />);

  await user.click(screen.getByRole("button", { name: "Save" }));

  expect(await screen.findByRole("status")).toHaveTextContent("Saved");
});
```

Follow this sequence:

1. Arrange fixtures, mock functions, and test-specific MSW handlers.
2. Render the component or page.
3. Interact as a user would.
4. Assert the resulting DOM, accessibility state, navigation, or other public effect.

Prefer an observable product outcome over an internal call. A callback assertion can
be appropriate when that callback is the public contract of a small component, but do
not inspect React component instances, private state, child implementation details, or
hook call counts. React Testing Library does not provide shallow rendering.

## Test application-owned behavior

- Give each test one product or domain behavior and assert only the evidence needed
  to prove it. Multiple assertions are fine when they describe one outcome.
- Split behaviors that can fail independently. Acceptance criteria define coverage,
  not test-case boundaries; a test name containing "and" is a prompt to reconsider.
- Exercise dependencies through the real UI, but do not re-test their documented
  defaults. Test the configuration, transformation, policy, or integration we add.

## Choose both the query type and the query target

Every query has two parts:

- The **type** (`getBy`, `queryBy`, or `findBy`) describes when the element should
  exist and whether the query retries.
- The **target** (`Role`, `LabelText`, `Text`, and so on) describes how a user finds
  the element.

### Query types

| Query         | No matches | One match        | Multiple matches | Retries |
| ------------- | ---------- | ---------------- | ---------------- | ------- |
| `getBy*`      | Throws     | Returns element  | Throws           | No      |
| `queryBy*`    | `null`     | Returns element  | Throws           | No      |
| `findBy*`     | Rejects    | Resolves element | Rejects          | Yes     |
| `getAllBy*`   | Throws     | Returns array    | Returns array    | No      |
| `queryAllBy*` | `[]`       | Returns array    | Returns array    | No      |
| `findAllBy*`  | Rejects    | Resolves array   | Resolves array   | Yes     |

Use them according to the state the test expects:

```tsx
// It must exist now.
const saveButton = screen.getByRole("button", { name: "Save" });

// It must not exist now. queryBy prevents the query itself from throwing.
expect(screen.queryByRole("alert")).not.toBeInTheDocument();

// It will appear after asynchronous work.
expect(await screen.findByRole("status")).toHaveTextContent("Saved");

// The number of matches is part of the behavior.
expect(screen.getAllByRole("listitem")).toHaveLength(3);
```

Do not use `queryBy*` for positive assertions. A `getBy*` failure gives a better error
and proves that exactly one match exists. Do not use an `*AllBy*` query merely to avoid
an error about ambiguous matches; disambiguate the user-facing target instead.

### Query priority

Choose the strongest user-facing query that the interface supports.

1. **`ByRole` with an accessible name** is the default for interactive controls,
   landmarks, headings, and other elements exposed in the accessibility tree.

   ```tsx
   screen.getByRole("button", { name: "Create goal" });
   screen.getByRole("navigation", { name: "Primary" });
   screen.getByRole("heading", { name: "Goals", level: 1 });
   ```

   Use role state filters when the state identifies the element:

   ```tsx
   screen.getByRole("button", { name: "Dark", pressed: true });
   screen.getByRole("tab", { name: "Upcoming", selected: true });
   screen.getByRole("checkbox", { name: "Completed", checked: false });
   screen.getByRole("link", { name: "Goals", current: "page" });
   ```

2. **`ByLabelText`** is appropriate for labeled form controls. It is the required
   semantic fallback for `<input type="password">`, which has no implicit role.

   ```tsx
   screen.getByLabelText("Password");
   ```

3. **`ByText`** locates non-interactive content. Use **`ByDisplayValue`** when the
   displayed value of an input, textarea, or select identifies it, and **`ByAltText`**
   when an image's text alternative is the relevant contract.

4. **`ByPlaceholderText`** and **`ByTitle`** are weaker fallbacks. A placeholder is
   not a label, and a title is not consistently exposed to all users.

5. **`ByTestId`** is the last resort for content that has no meaningful role, label,
   text, or value. A test ID is invisible to users. Before adding one, verify that the
   absence of a semantic query is not an accessibility defect.

Do not select application elements by CSS class, implementation-only attribute, DOM
position, or element ID. When a semantic query is unavailable, prefer an explicit
`data-testid` escape hatch over disguising a structural selector as user behavior.

### Match text deliberately

A string matches the complete normalized value and is case-sensitive by default. Use
it when exact wording is part of the contract. Use a controlled regular expression
when case or a specific portion of the text may vary.

```tsx
screen.getByRole("button", { name: "Save changes" });
screen.getByRole("button", { name: /^save (draft|changes)$/i });
```

Avoid broad expressions such as `/save/i` when both "Save" and "Save as template"
could exist. Never use the global `/g` flag in a query: regular expressions with
mutable `lastIndex` state can produce inconsistent results across repeated calls.

## Prefer `screen`; scope repeated content with `within`

Use `screen` for document-wide queries. It makes the query source consistent and
continues to work for content rendered through a portal.

Use `within` when the same control appears in multiple meaningful regions. First find
the region semantically, then query inside it:

```tsx
import userEvent from "@testing-library/user-event";

import { render, screen, within } from "@/test/test-utils";

it("edits the Morning routine", async () => {
  const user = userEvent.setup();

  render(<RoutineList />);

  const routine = screen.getByRole("group", { name: "Morning" });
  await user.click(within(routine).getByRole("button", { name: "Edit" }));

  expect(screen.getByRole("dialog", { name: "Edit Morning" })).toBeVisible();
});
```

Do not destructure bound queries from the result of `render`. The result should be
destructured only for React lifecycle utilities such as `rerender` or `unmount`.

## Let semantic queries exercise accessibility

Role and label queries use the browser's accessibility model. If a query cannot find
the intended control, inspect the rendered semantics before weakening the test. The
component may be missing a label, using the wrong native element, or computing an
unexpected accessible name.

- Prefer native semantic HTML. Do not add a redundant role such as `role="button"` to
  a `<button>`.
- Never add a role that conflicts with an element's native semantics.
- Do not add `aria-label`, `aria-labelledby`, or other ARIA solely to make a test pass.
  Fix the user-facing accessibility contract.
- Prefer role state filters over reading raw ARIA attributes when the filter expresses
  the behavior.

Queries by role exclude elements outside the accessibility tree by default. Use
`{ hidden: true }` only when intentionally testing such content:

```tsx
const closedDialog = screen.getByRole("dialog", { hidden: true });
expect(closedDialog).not.toBeVisible();
```

Do not enable `hidden` globally or use it as a shortcut around inaccessible markup.
Semantic queries provide valuable accessibility coverage, but they are not a complete
accessibility audit.

## Wait for observable changes

Testing Library's async utilities retry DOM queries or assertions. They replace manual
sleeps and arbitrary polling.

### Prefer `findBy` for appearance

When a new element should appear, query it directly with `findBy*`:

```tsx
await user.click(screen.getByRole("button", { name: "Load goals" }));

const alert = await screen.findByRole("alert");
expect(alert).toHaveTextContent("Goals could not be loaded");
```

Do not write `waitFor(() => screen.getByRole(...))` when `findByRole` expresses the
same expectation.

### Use `waitFor` for a changing assertion

Use `waitFor` when an existing element, mock function, or other observable value will
change and no `findBy*` query expresses the condition:

```tsx
const saveButton = screen.getByRole("button", { name: "Save" });

await waitFor(() => {
  expect(saveButton).toBeEnabled();
});
```

Keep the callback limited to one assertion. Testing Library may execute it multiple
times, so never put `user` interactions, `rerender`, mock setup, or other side effects
inside it. If more assertions belong to the completed state, wait for one defining
condition and make the remaining synchronous assertions afterward.

### Use `waitForElementToBeRemoved` for disappearance

```tsx
await waitForElementToBeRemoved(() => screen.queryByRole("progressbar"));

expect(screen.getByRole("heading", { name: "Goals" })).toBeVisible();
```

The element must exist before waiting begins. For immediate absence, use `queryBy*`
without a wait.

Always await `findBy*`, `findAllBy*`, `waitFor`, and
`waitForElementToBeRemoved`. Never await `getBy*`, `queryBy*`, or a synchronous
jest-dom matcher. Do not increase a timeout until the reason the normal retry window
is insufficient is understood and documented.

## Use the React APIs selectively

### `render`

Always use the custom `render` from `@/test/test-utils`. It creates the standard
providers for each call. Render inside each test, not in `beforeEach`, so the complete
scenario is visible and no rendered state is shared between tests.

### `rerender`

Use `rerender` only when preserving the mounted component while its props change is
the behavior under test:

```tsx
const { rerender } = render(<Greeting name="Ada" />);

expect(screen.getByRole("heading", { name: "Hello, Ada" })).toBeVisible();

rerender(<Greeting name="Grace" />);

expect(screen.getByRole("heading", { name: "Hello, Grace" })).toBeVisible();
```

For a user-driven change, interact with the UI instead. Do not use `rerender` to reach
state a user could reach normally.

### `unmount`

Use `unmount` only when unmount behavior is the contract, such as removing a global
listener or cancelling external work. Normal cleanup is automatic after every test;
never call `cleanup()` manually.

### `act`

`render`, `rerender`, and Testing Library's event utilities coordinate their React
updates. Do not wrap them in `act()`. Manual `act` is an exceptional escape hatch for
an external update that cannot be triggered through a Testing Library API; document
why it is required.

### Portals and snapshots

Use `screen` for portals because it is bound to `document.body`, not only the render
container. Avoid `container.querySelector`, DOM traversal, and raw node access.

Snapshots and `asFragment()` are not the default. Prefer focused semantic assertions
that explain the behavior being protected. Use a snapshot only when the serialized
structure itself is an intentionally reviewed contract.

## Prefer testing hooks through a consumer

Test a hook through the component that gives it user-visible meaning whenever
possible. This covers the hook together with React rendering and its providers.

Use `renderHook` only when a reusable hook's returned API is itself the public
contract and a component would add irrelevant behavior:

```tsx
import { renderHook } from "@/test/test-utils";

it("returns the initial pagination state", () => {
  const { result } = renderHook(() => usePagination({ initialPage: 2 }));

  expect(result.current.page).toBe(2);
});
```

The custom `render` wrapper does not automatically apply `TestProviders` to
`renderHook`. Prefer a small consumer rendered with the custom `render` for a
provider-dependent hook rather than recreating the application's provider graph in
each hook test.

## Debug semantic failures methodically

Do not commit debugging helpers. When a semantic query fails:

1. Read the error first. Failed `getBy*` and `findBy*` queries automatically print the
   relevant DOM and often suggest a better query.
2. Inspect roles and accessible names with `logRoles`:

   ```tsx
   import { logRoles, render } from "@/test/test-utils";

   const { baseElement } = render(<ProfileForm />);
   logRoles(baseElement);
   ```

3. Temporarily print a focused node with `screen.debug(element)` rather than dumping a
   large document.
4. Use `screen.logTestingPlaygroundURL()` when the best semantic query remains unclear.
5. Remove every debugging call before committing the test.

Do not respond to a failed role query by immediately switching to `getByTestId` or a
CSS selector. Determine whether the query is wrong, the expected state has not yet
arrived, or the component's accessibility contract is broken.

## Manual Testing Library lint rules

Oxc does not run `eslint-plugin-testing-library`, so AI agents must enforce its
high-value React rules while authoring and reviewing tests.

| Avoid                                                         | Require                                                              |
| ------------------------------------------------------------- | -------------------------------------------------------------------- |
| Imports from `@testing-library/react` or `/dom`               | Imports from `@/test/test-utils`                                     |
| Queries destructured from `render`                            | `screen` queries; `within` for a meaningful subtree                  |
| Unhandled `findBy*`, `waitFor`, or removal promises           | Await every async query and utility                                  |
| `await` on `getBy*`, `queryBy*`, or sync matchers             | Call synchronous queries and matchers directly                       |
| `container.querySelector`, DOM traversal, or raw node access  | Semantic queries, with `data-testid` only as an explicit last resort |
| `render` in `beforeEach` or another lifecycle hook            | Render the complete scenario inside each test                        |
| Interactions, `rerender`, or setup inside `waitFor`           | A side-effect-free retry callback with one assertion                 |
| `waitFor(() => getBy*(...))`                                  | The equivalent `findBy*` query                                       |
| Manual `cleanup()`                                            | Automatic cleanup                                                    |
| Wrapping Testing Library APIs in `act()`                      | Manual `act` only for a documented external-update exception         |
| `/pattern/g` in a query                                       | A stateless string or regular expression                             |
| `screen.debug`, `logRoles`, or Playground logging in a commit | Remove temporary debugging utilities after diagnosing the failure    |

Also follow the interaction rules in the User-Event guide: use a session created by
`userEvent.setup()`, prefer `user-event` over `fireEvent`, and await every interaction.
