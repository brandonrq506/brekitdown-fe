# TanStack Query and Axios guidelines

TanStack Query owns server-state identity, caching, cancellation, and pagination state.
Axios translates the typed query context into an HTTP request. Keep those responsibilities
connected so a request cannot drift from the cache entry that initiated it.

This guide covers read operations implemented as TanStack query functions. Mutation functions do
not receive `QueryFunctionContext` and follow their own mutation and invalidation contracts.

## Canonical pattern

Put every variable that changes the returned server data in the query key. Type the query function
from that key factory, extract the request variables from `QueryFunctionContext`, and pass the
query function directly to `queryOptions`.

```ts
export const goalKeys = {
  details: () => [{ feature: "/goals", entity: "details" }] as const,
  detail: (referenceXid: string) => [{ ...goalKeys.details()[0], referenceXid }] as const,
};
```

```ts
import type { QueryFunctionContext } from "@tanstack/react-query";

import type { goalKeys } from "@/features/goals/api/queries";

type GoalDetailQueryKey = ReturnType<typeof goalKeys.detail>;

export const getGoal = async ({
  queryKey: [{ referenceXid }],
  signal,
}: QueryFunctionContext<GoalDetailQueryKey>): Promise<GoalResponse> => {
  const { data } = await api.get<GoalResponse>(`/goals/${referenceXid}`, { signal });

  return data;
};
```

```ts
export const goalQueries = {
  detail: (referenceXid: string) =>
    queryOptions({
      queryKey: goalKeys.detail(referenceXid),
      queryFn: getGoal,
    }),
};
```

This creates one data path: the factory puts `referenceXid` in the key, TanStack passes that exact
key to the query function, and Axios builds the URL from it.

## Derive request variables from the query key

Do not pass or close over a request variable separately when it is already represented in the
query key.

```ts
// Avoid: referenceXid reaches the key and request through separate paths.
queryOptions({
  queryKey: goalKeys.detail(referenceXid),
  queryFn: (context) => getGoal(referenceXid, context),
});
```

```ts
// Require: the query function receives the key that identifies its cache entry.
queryOptions({
  queryKey: goalKeys.detail(referenceXid),
  queryFn: getGoal,
});
```

Apply these rules:

- Include every response-changing input in the key: resource identifiers, page size, filters,
  sorting, search terms, locale, and similar inputs.
- Extract those values from `context.queryKey` inside the query function.
- Do not put authentication tokens or other secrets in query keys. Authentication belongs in the
  configured Axios client or interceptor.
- Keep keys serializable, deterministic, and hierarchical so invalidation can target list and
  detail families precisely.
- If a value changes the response but is absent from the key, differently parameterized requests
  can incorrectly share one cache entry.

## Always parameterize `QueryFunctionContext`

Do not use bare `QueryFunctionContext`. Its default `QueryKey` type is too broad to prove which
fields exist.

Derive the key type from the key factory:

```ts
type GoalDetailQueryKey = ReturnType<typeof goalKeys.detail>;
type GoalDetailQueryContext = QueryFunctionContext<GoalDetailQueryKey>;
```

This keeps the runtime key and compile-time query-function contract synchronized. Do not rewrite
the key as a separate tuple or object type.

Use `import type` when an Axios query function references a key factory only for `ReturnType`. The
import is erased from the emitted JavaScript and does not create a runtime dependency cycle. If
key definitions become large or are needed by many modules, move them into a feature-level
`keys.ts` module rather than duplicating their shapes.

## Infinite queries: key inputs versus `pageParam`

An infinite query has one cache entry containing multiple pages. Stable inputs belong in the query
key; the current traversal position belongs in `pageParam`.

For the goals list:

- `pageSize` belongs in the query key because changing it identifies a different list.
- The current page number belongs in `pageParam` because it identifies one page within that list.
- The `AbortSignal` comes from the same context and is forwarded to Axios.

```ts
type GoalListQueryKey = ReturnType<typeof goalKeys.list>;
type GoalListQueryContext = QueryFunctionContext<GoalListQueryKey, number>;

export const getGoals = async ({
  queryKey: [{ pageSize }],
  pageParam,
  signal,
}: GoalListQueryContext): Promise<GoalsResponse> => {
  const { data } = await api.get<GoalsResponse>("/goals", {
    params: {
      page: pageParam,
      page_size: pageSize,
    },
    signal,
  });

  return data;
};
```

```ts
infiniteQueryOptions({
  queryKey: goalKeys.list(pageSize),
  queryFn: getGoals,
  initialPageParam: 1,
  getNextPageParam: (lastPage) => lastPage.meta.next_page ?? undefined,
});
```

Pass the page type as the second `QueryFunctionContext` generic so `pageParam` is not `unknown`.
Do not add the current page number to this infinite-query key; doing so would split each page into
a separate cache entry instead of one `InfiniteData` value. Traditional non-infinite pagination is
different and normally includes the current page in its query key.

Do not use `context.direction`. TanStack has deprecated it. If a future bidirectional query needs
direction as data, include it in the page-param value returned by `getNextPageParam` or
`getPreviousPageParam`.

## Forward cancellation to Axios

Always pass `context.signal` to Axios:

```ts
const { data } = await api.get<Response>(url, { signal });
```

TanStack can then cancel an abandoned or superseded request. Do not create a separate
`AbortController` inside the query function; that would disconnect Axios from TanStack's query
lifecycle.

Axios rejects non-successful HTTP responses, so return the response data and let the rejected
promise reach TanStack Query's error state. Do not catch an error merely to return `undefined`;
query functions must resolve actual data or reject.

## Use `client` and `meta` deliberately

`QueryFunctionContext` also supplies `client` and `meta`, but most Axios query functions do not
need them.

- Use `client` only when the query function genuinely needs another cached value. Do not use it to
  hide a missing query-key dependency.
- Use `meta` for optional query behavior or diagnostics that do not define the returned data.
- If a `meta` value changes which data the server returns, move that value into the query key.

## Keep wire translation at the Axios boundary

Query keys use application vocabulary and TypeScript naming. Translate those values to the API's
wire contract only when constructing the Axios request.

```ts
queryKey: [{ pageSize }]

params: {
  page_size: pageSize,
}
```

This keeps `snake_case` API details out of components and key factories while preserving the exact
backend contract in one transport-facing location.

Return the response envelope expected by the feature type:

```ts
const { data } = await api.get<GoalsResponse>("/goals", options);
return data;
```

If the same HTTP operation later needs to run outside TanStack Query, split it into a pure Axios
request plus a thin context adapter. Do not add that extra layer speculatively while the operation
is only a query function.

## Testing the integration

Protect the source-of-truth relationship with focused tests:

- Build the context with the real key factory rather than a handwritten key.
- Verify identifiers from a detail key reach the request URL.
- Verify stable list inputs from the key and the current `pageParam` reach query parameters.
- Verify the TanStack-provided signal is forwarded to Axios.
- Verify differently parameterized keys do not compare equal.
- Use component integration tests for loading, errors, retries, and rendered data; do not reproduce
  TanStack Query's internal cache algorithm in application tests.

## References

- [TanStack Query: Query functions and QueryFunctionContext](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions#queryfunctioncontext)
- [TanStack Query: Query keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [TanStack Query: Query cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)
- [TanStack Query: Infinite queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries)
- [Axios: Cancellation](https://axios-http.com/docs/cancellation)
