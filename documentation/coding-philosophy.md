# Coding philosophy

Structure code so that doing the correct thing is straightforward, mistakes are harder to introduce, and a shared decision can be changed in one place.

Apply this philosophy whenever you add or change code. Maintainability depends on how much a future contributor must remember, how many definitions must stay synchronized, and how reliably a correction reaches every consumer. Prefer designs that encode these relationships in types, interfaces, and shared behavior.

## Give shared knowledge one authoritative home

When multiple callers need the same decision, give that decision a single owner and have callers use it.

The goals [query factory](../src/features/goals/api/queries.ts) owns query keys and typed query options. The route loader calls `queryClient.ensureInfiniteQueryData(goalQueries.list())`, and the page passes options from `goalQueries.list()` to `useSuspenseInfiniteQuery`. Both obtain the query key, query function, and pagination behavior from the same definition.

Writing those options independently would require every caller to remember the same key shape, defaults, and pagination rules. The factory removes that repeated responsibility. A correction to the shared options reaches both loading and rendering code.

The same ownership extends to cache operations: [the create mutation](../src/features/goals/api/tanstack/createGoalMutation.ts) uses `goalKeys.detail(...)` to populate the detail cache and `goalKeys.lists()` to invalidate lists. Use these factories instead of reconstructing keys at call sites, so fetching and cache maintenance agree on query identity.

## Derive what can be derived

If one definition follows from another, express that relationship in code. Avoid maintaining two independent descriptions of the same fact.

For example, [pagination types](../src/types/pagination.ts) derive the allowed page sizes from the runtime [pagination constants](../src/constants/pagination.ts):

```ts
export type PageSize = (typeof PAGE_SIZES)[number];
```

Changing the supported values updates the type automatically. A separately written union could drift from the values the application actually uses.

The [goal list query function](../src/features/goals/api/axios/getGoals.ts) applies the same idea to its inputs:

```ts
type GoalListQueryKey = ReturnType<typeof goalKeys.list>;
type GoalListQueryContext = QueryFunctionContext<GoalListQueryKey, PaginationParams["page"]>;
```

It reads `pageSize` from the query key and the requested page from `pageParam`. This ties the request's page size to its cache identity, avoiding a separate argument that could disagree with the key. Deriving the context type also lets TypeScript expose incompatible usages when the key changes.

## Model shared contracts once

Application-wide contracts belong in `src/types`, where their consumers can share one definition. Feature-specific contracts belong with their feature.

[`PaginatedResponse<T>`](../src/types/pagination.ts) defines the shared response envelope and pagination metadata. [`ApiResource`](../src/types/core/helpers.ts) defines common resource fields. The [goal types](../src/features/goals/types/goal.ts) reuse them through `PaginatedResponse<Goal>` and `Goal extends ApiResource`.

Repeating those fields in each entity would allow inconsistent names, nullability, or metadata shapes. With a shared contract, one correction updates every consuming type, and incompatible usages can be caught by the compiler. Check affected consumers when changing a shared contract; its reach is precisely why accuracy matters.

Types must describe the actual API contract. TypeScript checks how code uses those declarations; it does not validate server responses at runtime. See the [TypeScript guidelines](typescript-guidelines.md) for detailed modeling rules.

## Encapsulate details that callers could forget

Reusable behavior should carry the details required to use it correctly, especially when omissions are easy to overlook.

The shared [form controls](../src/components/form/field-control.tsx), `InputField` and `TextareaField`, associate labels with controls, generate IDs when needed, connect descriptions and errors through `aria-describedby`, and reflect errors in `aria-invalid`. Their shared helper keeps ID and description association logic in one place.

Each form supplies its label, description, and error instead of rebuilding those relationships. This reduces opportunities for missing or mismatched accessibility attributes, and a correction to the shared wiring benefits its consumers. Prefer extending the responsible shared component when a requirement belongs to that component's existing responsibility.

## Keep ownership clear and abstractions proportionate

Place code with the feature that owns it. Place application-wide concepts in shared directories. Place page-specific code colocated in the `routes` directory. This makes the authoritative definition easy to find and keeps feature details close to the code that uses them.

Share concepts that must remain consistent and change together. Similar-looking code alone is insufficient reason to couple two responsibilities. An abstraction should remove a concrete source of mistakes or own a coherent piece of behavior; it should remain understandable without anticipating hypothetical features.

For example, goal query policy stays in the goals feature, while the pagination response contract lives in `src/types`. Both have one owner at the scope where their meaning belongs. Use this same judgment for components, utilities, constants, and future features.

## Before adding or changing code

- Where does this decision already live? Find its owner before adding another definition.
- Can this value, type, or behavior be reused or derived from an existing source of truth?
- What could a caller accidentally omit or mismatch? Can the interface prevent that mistake?
- If this rule changes, can it be corrected in one place and checked across its consumers?
- Does the abstraction own a concrete responsibility, and is it located at the appropriate scope?
