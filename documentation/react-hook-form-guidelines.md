# React Hook Form guidelines

Use React Hook Form (RHF) as the single source of truth for form values,
validation state, and submission state. Prefer RHF's subscription APIs over
mirroring form data in React state.

These guidelines are component-library agnostic. The Headless UI example only
illustrates how to adapt a controlled third-party component.

## API decision guide

| Need                                      | Use                                 | Avoid                                                   |
| ----------------------------------------- | ----------------------------------- | ------------------------------------------------------- |
| Native input, textarea, or select         | `register`                          | `Controller` without a controlled-component requirement |
| Controlled third-party component          | `useController` or `Controller`     | Local state synchronized with RHF                       |
| Value used during render                  | `useWatch`                          | `watch()` or `getValues()` during render                |
| Field or section state used during render | `fieldState` or `useFormState`      | Passing the full `formState` object through props       |
| One-time value inside an event handler    | `getValues`                         | A render subscription that is not displayed             |
| Observation that must not render React    | `subscribe`                         | Deprecated callback-style `watch`                       |
| Dynamic object list                       | `useFieldArray`                     | Managing a parallel array in React state                |
| Deep access to one form                   | `FormProvider` and `useFormContext` | Prop drilling every method or nesting providers         |

## shadcn integration and component ownership

Keep the design system in three layers so shadcn styling, RHF state, and feature
behavior can evolve independently:

1. `src/components/ui` contains library-agnostic shadcn primitives such as
   `Field`, `Input`, `Textarea`, and `Select`. These components must not import
   RHF.
2. `src/components/form` contains reusable, library-agnostic field composites
   such as `InputField` and `TextareaField`. They own labels, descriptions,
   error markup, and accessible ID wiring while forwarding native control
   props and refs.
3. Feature components own `useForm`, field names, validation rules, API mapping,
   and submission behavior.

Use `register` with the shared native field composites. Spreading the complete
registration result preserves RHF's `name`, `ref`, `onChange`, and `onBlur`
contract:

```tsx
<InputField
  label="Display name"
  description="This name is visible to your team."
  error={errors.displayName?.message}
  required
  {...register("displayName", {
    required: "Display name is required.",
  })}
/>
```

Do not wrap a native shadcn `Input` or `Textarea` in `Controller` merely because
it is a component. Both expose native control props and refs, so registration is
the simpler and more efficient boundary.

For controlled shadcn widgets, keep the adapter in a small component and use
`useController`. Forward the complete field contract to the focusable trigger:

```tsx
import { type Control, useController } from "react-hook-form";

interface ProfileFormValues {
  roleId: string | null;
}

interface RoleFieldProps {
  control: Control<ProfileFormValues>;
}

const RoleField = ({ control }: RoleFieldProps) => {
  const { field, fieldState } = useController({
    control,
    name: "roleId",
    rules: { required: "Role is required." },
  });
  const errorId = `${field.name}-error`;

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Role</FieldLabel>
      <Select
        name={field.name}
        value={field.value ?? undefined}
        onValueChange={(value) => field.onChange(value ?? null)}
        disabled={field.disabled}
      >
        <SelectTrigger
          id={field.name}
          ref={field.ref}
          onBlur={field.onBlur}
          aria-invalid={fieldState.invalid}
          aria-describedby={fieldState.error ? errorId : undefined}
        >
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>{/* Options */}</SelectContent>
      </Select>
      {fieldState.error && <FieldError id={errorId} errors={[fieldState.error]} />}
    </Field>
  );
};
```

Keep server validation at the feature boundary. Read the shared API validation
envelope, map recognized keys with `setError`, and place network, server, or
unknown-key failures in `root.server`. A form-level error must remain visible
without clearing the user's values.

## Canonical form pattern

Define one form-value type, provide complete defaults, register native fields,
and subscribe only where a value is rendered.

```tsx
import { useForm, useWatch } from "react-hook-form";

interface ProfileFormValues {
  displayName: string;
  email: string;
  roleId: string | null;
}

const defaultValues = {
  displayName: "",
  email: "",
  roleId: null,
} satisfies ProfileFormValues;

interface Props {
  onSubmit: (values: ProfileFormValues) => Promise<void>;
}

export const ProfileForm = ({ onSubmit }: Props) => {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ProfileFormValues>({ defaultValues });

  const roleId = useWatch({ control, name: "roleId", exact: true });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="display-name">Display name</label>
      <input
        id="display-name"
        aria-invalid={Boolean(errors.displayName)}
        {...register("displayName", { required: "Display name is required" })}
      />
      {errors.displayName && <p role="alert">{errors.displayName.message}</p>}

      <RoleField control={control} />
      {roleId === "admin" && <p>Admins can manage team members.</p>}

      <button type="submit" disabled={isSubmitting}>
        Save
      </button>
    </form>
  );
};
```

## Model values and defaults explicitly

- Always pass the form value type to `useForm<FormValues>()`.
- Prefer domain-shaped field names. Keep API serialization and parsing at the
  form boundary instead of weakening the form type.
- Provide every field's initial value in `defaultValues`. RHF needs one complete
  baseline to calculate `isDirty` and `dirtyFields` correctly.
- Never use `undefined` as a field default or send `undefined` through a
  controlled field's `onChange`. Use `""`, `null`, `false`, or an empty object or
  array according to the domain.
- Use `satisfies FormValues` on a shared default object to catch missing fields
  without widening its values unnecessarily.
- Do not store custom class instances or objects with prototype methods in
  `defaultValues`. Normalize dates and other rich values at the boundary.
- Keep the submitted type truthful. If an input edits a string but the domain
  needs a number or date, transform it deliberately with `valueAsNumber`,
  `valueAsDate`, `setValueAs`, a resolver, or the submit mapper.

`defaultValues` are cached after initialization. Use `reset(nextValues)` when a
new record becomes the editing baseline. Use the reactive `values` option only
when external state intentionally remains authoritative; incoming changes can
overwrite form values, so configure `resetOptions` when dirty values or errors
must survive.

## Prefer `register` for native controls

RHF is optimized around uncontrolled native inputs. Use `register` for an
`input`, `textarea`, or native `select` unless its value is genuinely controlled
by another component API.

```tsx
<input
  type="number"
  {...register("quantity", {
    min: { value: 1, message: "Quantity must be at least 1" },
    required: "Quantity is required",
    valueAsNumber: true,
  })}
/>
```

- Spread the complete registration result so `name`, `ref`, `onChange`, and
  `onBlur` reach the actual form control.
- Reusable native input wrappers should accept
  `UseFormRegisterReturn` or forward the relevant input props and ref. Do not
  make the wrapper import a feature-specific form type.
- Put custom change and blur behavior in `register(name, { onChange, onBlur })`
  or compose handlers without dropping RHF's handlers.
- Do not also pass `value` and a local `onChange` to a registered uncontrolled
  input.
- Never register the same field again inside a `Controller` or `useController`
  adapter.

## Adapt controlled components at one boundary

Use `Controller` for a small one-off adapter. Use `useController` when building a
reusable form component or when the field markup needs direct access to
`fieldState`.

The adapter must wire RHF's complete field contract:

- `field.value` to the component's selected value;
- `field.onChange` to the component's value callback, mapping its payload when
  necessary;
- `field.onBlur` to the actual blur/touch boundary;
- `field.name` where the component accepts a name;
- `field.ref` to the focusable element so RHF can focus invalid fields;
- `field.disabled` to the component's disabled state; and
- `fieldState.error` to accessible error UI.

Headless UI example:

```tsx
import {
  Field,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { type Control, useController } from "react-hook-form";

const roles = [
  { id: "admin", label: "Administrator" },
  { id: "member", label: "Member" },
] as const;

interface ProfileFormValues {
  displayName: string;
  email: string;
  roleId: string | null;
}

interface RoleFieldProps {
  control: Control<ProfileFormValues>;
}

export const RoleField = ({ control }: RoleFieldProps) => {
  const { field, fieldState } = useController({
    control,
    name: "roleId",
    rules: { required: "Role is required" },
  });
  const errorId = "role-error";
  const selectedRole = roles.find((role) => role.id === field.value);

  return (
    <Field>
      <Label>Role</Label>
      <Listbox
        name={field.name}
        value={field.value}
        onChange={field.onChange}
        disabled={field.disabled}
      >
        <ListboxButton
          ref={field.ref}
          onBlur={field.onBlur}
          aria-invalid={fieldState.invalid}
          aria-describedby={fieldState.error ? errorId : undefined}
        >
          {selectedRole?.label ?? "Select a role"}
        </ListboxButton>
        <ListboxOptions anchor="bottom">
          {roles.map((role) => (
            <ListboxOption key={role.id} value={role.id}>
              {role.label}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
      {fieldState.error && (
        <p id={errorId} role="alert">
          {fieldState.error.message}
        </p>
      )}
    </Field>
  );
};
```

Do not call `setValue` from a controlled component's ordinary change handler.
`field.onChange` already updates the value, touched/dirty state, and validation.
Map `undefined` emitted by a UI library to a valid empty value such as `null`.

## Use explicit subscriptions for rendered state

### Use `useWatch`, not `watch`, during render

Use `useWatch` for conditional fields, previews, totals, and any value that
affects JSX. React's `incompatible-library` lint explicitly recommends
`useWatch` instead of RHF's `watch()` because the hook subscription is safe for
memoization and React Compiler. It also isolates re-renders at the component
where it is called.

```tsx
const country = useWatch({ control, name: "address.country", exact: true });
```

- Subscribe to the narrowest field or field list possible. Avoid watching the
  whole form when only one value is needed.
- Move a live preview or calculation into a small child component and call
  `useWatch` there so keystrokes do not re-render the form root.
- Use `compute` for a pure derived selection when the component needs only that
  result, not the complete subscribed object.
- Create the subscription before code can call `setValue` for that field.
  Updates made before the subscription exists are not emitted to it.
- Do not use callback-style `watch`; use `subscribe` when React must not render.

### Use `useFormState` for section-level state

Destructuring `formState` in the component that owns `useForm` is appropriate
for root concerns such as `isSubmitting`. In a field or large section, prefer
`fieldState` from `useController` or a narrow `useFormState` subscription.

```tsx
const { errors, isDirty } = useFormState({
  control,
  name: ["address.street", "address.city"],
  exact: true,
});
```

- Destructure every `formState` property needed during render. `formState` is a
  Proxy and only properties read during render are subscribed.
- Do not pass the Proxy through several component layers. Pass primitives or
  let the consumer call `useFormState`.
- Avoid conditional Proxy access such as
  `!formState.isDirty || !formState.isValid`; the short circuit can prevent a
  subscription. Read both properties first.

### Use snapshots and non-render subscriptions intentionally

`getValues` reads a snapshot without subscribing. Use it in submit handlers,
click/blur handlers, or imperative logic. Do not call it to produce reactive
JSX; it will not make the component update.

Use `subscribe` only for work that should observe RHF without rendering React,
such as forwarding a deliberately selected value to an external system. Select
only the names and form-state properties required, return the unsubscribe
function from the effect, and do not dispatch RHF updates such as `setValue` or
`reset` from the subscription callback.

## Compose large forms without duplicating form ownership

The form component should own one `useForm` instance. Pass `control` or
`register` directly to nearby children. Use `FormProvider` when deeply nested
form sections would otherwise receive several RHF props through unrelated
layers.

```tsx
const methods = useForm<CheckoutFormValues>({ defaultValues });

return (
  <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <AddressFields />
    </form>
  </FormProvider>
);
```

```tsx
const AddressFields = () => {
  const { control, register } = useFormContext<CheckoutFormValues>();
  const { errors } = useFormState({ control, name: "address" });

  // Render registered address fields.
};
```

- Do not nest `FormProvider` for the same logical form.
- Do not nest HTML `<form>` elements. A visual subsection is usually a
  `fieldset`, component, or section—not a second form.
- A genuinely independent form, such as a search box inside a page containing
  an editor, should own an independent `useForm` instance and submit boundary.
- Prefer `control` props for reusable controlled fields. Context is useful for
  form-specific sections; it should not make generic UI components depend on a
  surrounding provider invisibly.

## Validate deliberately

- Keep the default `mode: "onSubmit"` unless the UX requires earlier feedback.
  `mode: "onChange"` validates on every change and can cause significant
  re-render and validation work.
- Use `onBlur` or `onTouched` when users need feedback before submission but not
  on every keystroke. Controlled adapters must forward `field.onBlur` for these
  modes to work.
- Use field rules for small local constraints. Use a resolver for shared,
  cross-field, or domain schemas; infer or align the RHF value type with that
  schema instead of maintaining contradictory definitions.
- Return error messages from validators rather than booleans when the user
  needs an explanation.
- Keep server/API errors separate from client validation. Map field-specific
  server errors with `setError`; show non-field failures at a stable form-level
  location.
- Avoid async validation on every keystroke when the check belongs at submit or
  can be deferred to blur.
- Let `shouldFocusError` work: forward registered/controller refs to focusable
  elements and render fields in the intended focus order.

`handleSubmit` validates and collects values, but it does not swallow exceptions
from the submit callback. Catch expected request failures where the application
can present them, and use `formState.isSubmitting` for the pending UI.

Disabled fields are omitted from submitted values. Use `readOnly` or disable a
`fieldset` only when the value must remain part of the submission contract.

## Reset and mutate through RHF

- Use `reset(values)` when the entire editing baseline changes or after a
  successful create flow. Choose keep options explicitly; do not assume dirty
  values or errors will survive.
- Do not call `reset` during render. Call it from the event or synchronization
  boundary that receives the new baseline after the form subscription is ready.
- Use `resetField(name)` for one field rather than rebuilding the whole form.
- Prefer `field.onChange` for controlled user edits.
- Use `setValue(name, value, { shouldDirty, shouldTouch, shouldValidate })` for
  imperative updates and state the intended flags. Target the leaf field rather
  than replacing a large nested object when possible.
- Do not mirror RHF values into `useState` and synchronize both directions with
  effects. If another store must become authoritative, use `values` deliberately
  and document the ownership model.

## Manage dynamic lists with `useFieldArray`

Use `useFieldArray` for arrays of field objects that users add, remove, or
reorder.

```tsx
const { append, fields, remove } = useFieldArray({
  control,
  name: "contacts",
});

return fields.map((field, index) => (
  <div key={field.id}>
    <input {...register(`contacts.${index}.email`)} />
    <button type="button" onClick={() => remove(index)}>
      Remove contact
    </button>
  </div>
));
```

- Always use `field.id` as the React key, never the array index.
- Give append, prepend, insert, and update complete objects; do not pass partial
  rows.
- Do not create two `useFieldArray` hooks with the same name.
- Field arrays contain objects, not primitive-only rows. Model a primitive as an
  object property when it must be dynamically edited.
- Avoid `shouldUnregister: true` with field arrays; reorder and remount behavior
  can discard values.
- Avoid stacking multiple field-array mutations in one handler. Express the
  intended final operation directly or sequence it after the first render.
- `update` unmounts and remounts the row. Use `setValue` on a leaf when preserving
  row component state matters; use `replace` when replacing the whole array.

## Keep performance local

- Subscribe where data is displayed. Do not lift `useWatch` or `useFormState` to
  the form root merely to pass their results back down.
- Prefer uncontrolled registered inputs. Controlled components necessarily
  render from their current value, so isolate them behind small adapters.
- Avoid broad whole-form watches and broad `formState` consumption in large
  forms.
- Do not add `useMemo` or `useCallback` around RHF APIs by default. Measure a
  real render problem and preserve hook dependencies when optimization is
  justified.
- Do not use `"use no memo"` as a routine substitute for explicit subscription
  hooks. If a specific RHF/React Compiler version combination still fails,
  isolate the workaround, link the upstream issue, and cover reset, conditional
  fields, controlled fields, and field arrays with regression tests.

## Preserve accessibility across UI libraries

- Every field needs a visible label or an equivalent accessible name.
- Connect errors and descriptions with `aria-describedby`.
- Set `aria-invalid` from `fieldState.invalid` or the relevant error.
- Put errors near their field and use an appropriate live announcement such as
  `role="alert"` when errors appear after an interaction.
- Forward RHF's ref to the actual focusable control, not a decorative wrapper.
- Keep native submit behavior with `<form onSubmit={handleSubmit(...)}>` and a
  `type="submit"` button. Buttons that add/remove rows or reveal UI must use
  `type="button"`.

## Test user-visible form behavior

- Fill forms with realistic user interactions and submit through the button or
  form, not by calling `handleSubmit` directly.
- Test the form rules and policies the application owns, such as trimmed-value
  validation, payload normalization, API error mapping, pending-dismissal policy,
  and navigation after success.
- Treat errors, focus, pending state, and submission outcomes as coverage candidates,
  not a checklist. Split behaviors that can fail independently.
- Do not re-prove RHF defaults, native browser behavior, or component-library
  defaults unless the application changes them or the integration is at risk.
- Test adapters with the real component library when practical. A mock that
  reduces a controlled widget to a native input can hide missing `onBlur`, ref,
  disabled, or value mapping. Assert only the boundary the adapter owns.
- Cover initialization and `reset` when forms edit fetched records.
- Cover append, remove, and reorder behavior for field arrays; query rows by
  accessible content rather than array index.
- Do not assert RHF internals, registration calls, or render counts unless a
  measured performance regression is the behavior under test.

## Review checklist

- One typed `useForm` instance owns the logical form.
- All fields have non-`undefined` defaults.
- Native controls use `register`; controlled widgets have one adapter boundary.
- Controlled adapters forward value, change, blur, name, ref, disabled, and
  accessible error state.
- Rendered values use narrow `useWatch` subscriptions, never `watch()`.
- Nested or section state uses `fieldState` or narrow `useFormState`
  subscriptions.
- `getValues` is used only as an imperative snapshot.
- Validation timing matches the UX and does not validate every keystroke without
  a reason.
- Resets and imperative updates express their dirty, touched, validation, and
  baseline semantics.
- Field-array rows use `field.id` keys and complete row values.
- Tests exercise the form as a user and verify focused, application-owned outcomes.
- Independent form behaviors have independent tests when they can fail separately.

## References

- [React Hook Form documentation](https://react-hook-form.com/docs)
- [useForm](https://react-hook-form.com/docs/useform)
- [useController](https://react-hook-form.com/docs/usecontroller)
- [useWatch](https://react-hook-form.com/docs/usewatch)
- [useFormState](https://react-hook-form.com/docs/useformstate)
- [useFieldArray](https://react-hook-form.com/docs/usefieldarray)
- [React Compiler `incompatible-library` lint](https://react.dev/reference/eslint-plugin-react-hooks/lints/incompatible-library)
