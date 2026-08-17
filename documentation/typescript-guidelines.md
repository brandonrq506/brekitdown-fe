# TypeScript guidelines

## `interface` versus `type`

This section describes how we model TypeScript types in this project, especially API resources and request payloads.

### Prefer `interface` for extensible object shapes

Use an interface for an object model that represents an entity, resource, component contract, or other shape that can naturally extend another object shape.

```ts
interface ApiResource {
  reference_xid: string;
  inserted_at: string;
  updated_at: string;
}

interface Goal extends ApiResource {
  name: string;
  description: string | null;
}
```

Named interfaces and `interface extends` relationships can also be easier for TypeScript to cache and display in error messages than large intersection types.

Prefer extending an interface:

```ts
interface Goal extends ApiResource {
  name: string;
}
```

over using an intersection for ordinary object inheritance:

```ts
type Goal = ApiResource & {
  name: string;
};
```

### Prefer `type` for aliases and type operations

Use a type alias when the type is not simply an extensible object model. Common examples include unions, primitive aliases, tuples, function signatures, mapped types, conditional types, and utility-type results.

```ts
type GoalStatus = "scheduled" | "in_progress" | "completed";

type GoalReference = string;

type Coordinates = readonly [latitude: number, longitude: number];

type GoalByReference = Record<GoalReference, Goal>;

type GoalWithoutMetadata = Omit<Goal, keyof ApiResource>;
```

Use `type` with `as const` when deriving a union from runtime constants:

```ts
const GOAL_STATUS = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

type GoalStatus = ObjectValues<typeof GOAL_STATUS>;
```

This keeps the runtime values and compile-time union synchronized.

### Avoid relying on declaration merging

Declaration merging is useful when augmenting some third-party libraries, but accidental merging makes application types harder to locate and understand. Keep each application interface defined in one place.

```ts
interface Goal {
  name: string;
}

interface Goal {
  description: string | null;
}
```

## Model the API contract exactly

Frontend API types describe the JSON contract, not the database schema or the internal backend struct.

- Include only fields exposed by the API.
- Preserve the API's field names, including `snake_case` names such as `reference_xid` and `inserted_at`.
- Represent JSON timestamps as strings at the API boundary.
- Do not expose internal fields such as database IDs or foreign keys when the API does not return them.
- Keep the OpenAPI schema, JSON serializer, tests, and frontend type aligned.

```ts
interface ApiResource {
  reference_xid: string;
  inserted_at: string;
  updated_at: string;
}

interface Goal extends ApiResource {
  name: string;
  description: string | null;
}
```

Even though the timestamp strings use the ISO 8601 format, TypeScript cannot verify their format when they are typed as `string`. Parse them into `Date` objects only when the application needs date operations, and keep that conversion outside the API response type.

### Response envelopes

Represent the complete response returned by the endpoint, including its envelope.

```ts
interface GoalResponse {
  data: Goal;
}

interface GoalsResponse {
  data: Goal[];
}
```

Do not type a list endpoint as `Goal[]` when it actually returns `{ data: Goal[] }`.

### Request payloads

Represent the complete JSON request body, including nesting required by the API.

```ts
type GoalPayload = {
  goal: {
    name: string;
    description?: string | null;
  };
};

export type CreateGoalPayload = GoalPayload;
export type UpdateGoalPayload = GoalPayload;
```

Keep operation-specific exported names even when CREATE and UPDATE currently share the same shape. Their contracts may diverge later, and API functions remain explicit about which operation they accept.

If the operations already have different requirements, model them independently rather than forcing them through one shared type:

```ts
type CreateGoalPayload = {
  goal: {
    name: string;
    description?: string | null;
  };
};

type UpdateGoalPayload = {
  goal: {
    name?: string;
    description?: string | null;
  };
};
```

The types must follow the real API validation. Do not make UPDATE fields optional merely because partial updates are common if the endpoint actually requires them.

## Optional and nullable fields

Optional and nullable express different states:

```ts
type Example = {
  description?: string | null;
};
```

- The property is omitted: `description` was not sent.
- The property is present with `null`: explicitly use no value, often to clear an existing value.
- The property is present with a string: set or replace the value.

This distinction is especially important for UPDATE payloads:

```ts
const unchanged: UpdateGoalPayload = {
  goal: { name: "Learn TypeScript" },
};

const cleared: UpdateGoalPayload = {
  goal: { name: "Learn TypeScript", description: null },
};
```

For responses, do not mark a field optional if the serializer always includes it:

```ts
interface Goal {
  // The key is always present, but its value can be null.
  description: string | null;
}
```

Use an optional response field only when the key itself can genuinely be absent.

## General type-safety practices

### Use `import type` for type-only imports

```ts
import type { ApiResource } from "@/types/core/helpers";
```

This makes the module's runtime dependencies explicit and works well with `verbatimModuleSyntax`.

### Avoid `any`

Use a specific type when the shape is known. Use `unknown` when a value has not been validated yet.

```ts
function handleValue(value: unknown) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }

  return "";
}
```

`unknown` requires narrowing before use; `any` disables type checking.

### Avoid unnecessary type assertions

An assertion such as `value as Goal` does not validate data at runtime. Prefer typed API boundaries and narrowing. If runtime data is untrusted, TypeScript types alone are not validation.

### Do not duplicate source-of-truth values

When the application needs both runtime values and a union type, derive the type from an `as const` object or array. This prevents the two definitions from drifting apart.

## Decision checklist

Before adding a type, ask:

1. Is this an extensible object model? Prefer `interface`.
2. Is it a union, alias, tuple, mapped type, conditional type, or utility result? Prefer `type`.
3. Does it match the actual API envelope and field names?
4. Are optional properties truly omittable?
5. Are nullable values genuinely returned or accepted as `null`?
6. Are timestamps represented as strings at the API boundary?
7. Is the type feature-specific, or is it already shared by multiple features?
8. Can a type be derived from a runtime constant instead of duplicated?
9. Does the code avoid `any` and unjustified type assertions?
10. Do the OpenAPI schema, serializer, tests, and frontend type agree?
