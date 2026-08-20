# jest-dom guidelines

`jest-dom` matchers describe the DOM state that a user or assistive technology
receives. Prefer them over assertions against raw properties, attributes, or
truthiness because they express intent clearly and produce more useful failures.

This guide covers assertion ergonomics and best practices only. Installation and
Vitest setup belong elsewhere.

## Canonical pattern

Assert the user-observable result of an interaction with the most specific
matcher available.

```tsx
import userEvent from "@testing-library/user-event";

import { render, screen } from "@/test/test-utils";

it("disables saving after the request starts", async () => {
  const user = userEvent.setup();

  render(<ProfileForm />);

  const saveButton = screen.getByRole("button", { name: "Save" });
  await user.click(saveButton);

  expect(saveButton).toBeDisabled();
  expect(screen.getByRole("status")).toHaveTextContent("Saving");
});
```

```tsx
// Avoid: these expose implementation details and give poorer failure messages.
expect(saveButton.disabled).toBe(true);
expect(saveButton).toHaveAttribute("disabled");
expect(screen.getByRole("status").textContent).toContain("Saving");
```

## Distinguish presence from visibility

An element can be in the document and still be hidden. Choose the matcher that
describes the behavior under test.

```tsx
expect(screen.getByRole("main")).toBeInTheDocument();
expect(screen.getByRole("dialog", { hidden: true })).not.toBeVisible();
expect(screen.queryByRole("alert")).not.toBeInTheDocument();
```

- Use `getBy*` for an element that must exist now.
- Use `queryBy*` only when asserting that an element does not exist.
- Use `findBy*` when an element will appear asynchronously.
- Keep `toHaveLength()` for collections returned by `getAllBy*`, `queryAllBy*`,
  or `findAllBy*`.

```tsx
expect(await screen.findByRole("status")).toHaveTextContent("Saved");
expect(screen.getAllByRole("listitem")).toHaveLength(3);
```

Do not express presence with `toBeTruthy()`, `toBeDefined()`, null comparisons,
or a collection length. `toBeInTheDocument()` verifies actual document
membership. For an intentionally detached tree, assert containment instead:

```tsx
expect(detachedContainer).toContainElement(detachedItem);
```

## Prefer semantic state matchers

Use matchers that understand HTML and ARIA semantics rather than checking how a
state happens to be encoded.

```tsx
expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();

expect(screen.getByRole("checkbox", { name: "Email updates" })).toBeChecked();
expect(screen.getByRole("checkbox", { name: "Select all" })).toBePartiallyChecked();

expect(screen.getByRole("textbox", { name: "Email" })).toBeRequired();
expect(screen.getByRole("textbox", { name: "Email" })).toBeInvalid();
```

```tsx
// Avoid.
expect(submitButton.hasAttribute("disabled")).toBe(true);
expect(checkbox.checked).toBe(true);
expect(email.required).toBe(true);
expect(email.getAttribute("aria-invalid")).toBe("true");
```

Use the positive matcher that reads naturally. For example, prefer
`toBeEnabled()` over `not.toBeDisabled()` and `toBeValid()` over
`not.toBeInvalid()` when the positive state is the contract.

Note: `toBeDisabled()` and `toBeEnabled()` follow native HTML disabled semantics;
they do not treat `aria-disabled="true"` as a disabled element. If a custom ARIA
control uses `aria-disabled`, test the behavior that prevents interaction and
assert that attribute only when it is part of the accessibility contract.

For toggle buttons, assert the pressed state rather than reading
`aria-pressed`:

```tsx
const muteButton = screen.getByRole("button", { name: "Mute" });

await user.click(muteButton);

expect(muteButton).toBePressed();
expect(muteButton).toHaveAccessibleName("Unmute");
```

## Assert the accessibility contract

Prefer the computed accessibility API over individual `aria-*` implementation
details. These matchers account for labels and referenced elements instead of
requiring the test to know how the accessible result was assembled.

```tsx
const email = screen.getByRole("textbox", { name: "Email" });

expect(email).toBeInvalid();
expect(email).toHaveAccessibleErrorMessage("Enter a valid email address");
expect(email).toHaveAccessibleDescription("We will only use this for receipts");
```

Do not repeat what the query already proved. This adds no confidence:

```tsx
const saveButton = screen.getByRole("button", { name: "Save" });

expect(saveButton).toHaveRole("button");
expect(saveButton).toHaveAccessibleName("Save");
```

Use `toHaveRole()` or `toHaveAccessibleName()` when that value is itself the
changing behavior, when the element was obtained through another query, or when
you already hold a reference across an interaction.

## Assert values at the right level

Use `toHaveValue()` for the submitted value, `toHaveDisplayValue()` for what a
user sees in a form control, and `toHaveFormValues()` when the form payload is the
behavior under test.

```tsx
const form = screen.getByRole("form", { name: "Profile" });

expect(form).toHaveFormValues({
  displayName: "Ada Lovelace",
  notifications: true,
  timezone: "America/Costa_Rica",
});

expect(screen.getByRole("combobox", { name: "Timezone" })).toHaveDisplayValue("Costa Rica");
```

```tsx
// Avoid repeating a form-level assertion as raw control properties.
expect(nameInput.value).toBe("Ada Lovelace");
expect(notificationsInput.checked).toBe(true);
expect(timezoneSelect.value).toBe("America/Costa_Rica");
```

For content, use `toHaveTextContent()` and `toBeEmptyDOMElement()` instead of
reading `textContent`, `innerHTML`, or child counts.

```tsx
expect(screen.getByRole("status")).toHaveTextContent(/3 items selected/i);
expect(screen.getByRole("log")).toBeEmptyDOMElement();
```

A string passed to `toHaveTextContent()` is a partial, case-sensitive match. Use
an anchored regular expression when the complete text is the contract:

```tsx
expect(screen.getByRole("status")).toHaveTextContent(/^Saved$/);
```

## Use attributes and presentation matchers deliberately

First prefer a semantic matcher such as `toBeVisible()`, `toBeDisabled()`, or
`toHaveAccessibleName()`. When an attribute, class, or inline/computed style is
itself the contract, still use its jest-dom matcher rather than raw DOM access.

```tsx
expect(screen.getByRole("link", { name: "Reports" })).toHaveAttribute("href", "/reports");
expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");
expect(screen.getByTestId("map-marker")).toHaveClass("is-selected");
expect(screen.getByTestId("sidebar")).toHaveStyle({ width: "320px" });
```

Avoid class and style assertions when visible behavior can describe the same
contract. For example, `not.toBeVisible()` is more meaningful than checking for
a `hidden` class.

Avoid `toContainHTML()` for markup controlled by the application; it couples the
test to DOM structure. Prefer accessible queries and semantic matchers.
`toContainHTML()` is reserved for cases where consuming exact external HTML is
the behavior being tested.

## Assert focus, selection, and order directly

```tsx
expect(screen.getByRole("textbox", { name: "Search" })).toHaveFocus();
expect(screen.getByRole("textbox", { name: "Search" })).toHaveSelection("query");
expect(firstResult).toAppearBefore(secondResult);
```

Do not compare against `document.activeElement`, inspect selection properties,
or compare DOM positions manually.

## Wait for the DOM change, not the matcher

jest-dom matchers are synchronous and do not retry. Use Testing Library's async
queries for appearance and `waitFor()` when an existing element changes state.

```tsx
expect(await screen.findByRole("alert")).toHaveTextContent("Request failed");

await waitFor(() => {
  expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
});
```

```tsx
// Avoid: awaiting a synchronous matcher does not wait for the DOM to change.
await expect(saveButton).toBeEnabled();
```

## Manual jest-dom lint rules

Oxc does not run `eslint-plugin-jest-dom`, so AI agents must enforce its
recommended rules during authoring and review. Apply these transformations even
when `vp lint` cannot report them:

| Rule                          | Avoid                                                          | Require                                    |
| ----------------------------- | -------------------------------------------------------------- | ------------------------------------------ |
| `prefer-checked`              | `checked` property or attribute checks                         | `toBeChecked()` / `toBePartiallyChecked()` |
| `prefer-empty`                | `innerHTML` emptiness checks                                   | `toBeEmptyDOMElement()`                    |
| `prefer-enabled-disabled`     | `disabled` property or attribute checks                        | `toBeDisabled()` / `toBeEnabled()`         |
| `prefer-focus`                | comparisons with `document.activeElement`                      | `toHaveFocus()`                            |
| `prefer-in-document`          | truthy, defined, null, or single-result length presence checks | `toBeInTheDocument()`                      |
| `prefer-required`             | `required` property or attribute checks                        | `toBeRequired()`                           |
| `prefer-to-have-attribute`    | `getAttribute()` / `hasAttribute()` assertions                 | `toHaveAttribute()`                        |
| `prefer-to-have-class`        | `className` or `classList` assertions                          | `toHaveClass()`                            |
| `prefer-to-have-style`        | raw `style` assertions                                         | `toHaveStyle()`                            |
| `prefer-to-have-text-content` | `textContent` assertions                                       | `toHaveTextContent()`                      |
| `prefer-to-have-value`        | form control `value` property assertions                       | `toHaveValue()`                            |

Also follow `prefer-pressed`, even though it is not part of the recommended
preset: use `toBePressed()` / `toBePartiallyPressed()` instead of reading
`aria-pressed`.

Do not use deprecated matchers: replace `toBeEmpty()` with
`toBeEmptyDOMElement()`, `toBeInTheDOM()` with `toBeInTheDocument()` or
`toContainElement()`, and `toHaveDescription()` with
`toHaveAccessibleDescription()`. Use `toHaveAccessibleErrorMessage()` instead of
the deprecated `toHaveErrorMessage()`.
