# Loading route data with TanStack Query and TanStack Router

TanStack Router should coordinate when route data starts loading. TanStack Query should own the server-state cache, freshness rules, request deduplication, and component subscriptions.

## Project pattern

### 1. Define reusable query options

Keep the query key and query function in a feature-level factory. The same options must be used by the route loader and the component so both read and write the same cache entry.

```ts
import { infiniteQueryOptions } from "@tanstack/react-query";

export const goalQueries = {
  list: () =>
    infiniteQueryOptions({
      queryKey: [{ feature: "goals", entity: "list", pageSize: 20 }],
      queryFn: getGoals,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.meta.next_page ?? undefined,
    }),
};
```

`queryOptions` is primarily a type-safe way to share query configuration. Transport logic remains in the Axios layer.

See the [TanStack Query and Axios guidelines](./tanstack-query-axios-guidelines.md) for how query
keys, `QueryFunctionContext`, infinite-query page parameters, and cancellation map into Axios
requests.

### 2. Load critical data in the route loader

```ts
const goalsQueryOptions = goalQueries.list();

export const Route = createFileRoute("/goals")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(goalsQueryOptions);
  },
  component: Goals,
});
```

Await `ensureQueryData` for data required by the first render. It returns cached data immediately when available and fetches when the cache has no data. Awaiting it also routes an initial request failure through TanStack Router's error handling.

Keep an `async` block and do not return the query data when the loader only warms the Query cache. This avoids adding an unused, potentially large loader-data type to the generated route tree.

For stale cached data, `ensureQueryData` returns it by default. The mounted query subscription can refresh it according to the shared Query options. Set `revalidateIfStale: true` only when the loader should explicitly start that background refresh before the component mounts.

### 3. Subscribe to the same query in the component

```ts
function Goals() {
  const { data } = useSuspenseQuery(goalsQueryOptions);

  return <p>{data.data.length} goals loaded</p>;
}
```

The loader ensures the critical data exists before render; `useSuspenseQuery` reads it and keeps the component subscribed to cache updates and background refetches. Do not pass loader data into the component as a separate source of server state.

## Blocking versus background loading

- Await `ensureQueryData` for critical data that the route cannot render without.
- Start `queryClient.prefetchQuery(...)` without awaiting for secondary data that may load after the route renders.
- Independent critical queries can be awaited together with `Promise.all` to avoid request waterfalls.
- Use route-level pending and error components when the product needs custom loading or retry UI.

## Freshness and invalidation

- Configure `staleTime` in Query options or QueryClient defaults; avoid duplicating freshness policy in the Router.
- Invalidate the relevant query keys after mutations. Active route components then update from the shared cache.
- Keep query keys hierarchical so list and detail data can be invalidated precisely.
- Pass the query function's `AbortSignal` to Axios so abandoned navigations or queries can cancel in-flight requests.

## References

- [TanStack Router: External Data Loading](https://tanstack.com/router/latest/docs/guide/external-data-loading)
- [TanStack Router: Router Context](https://tanstack.com/router/latest/docs/guide/router-context)
- [TanStack Router: Preloading with external libraries](https://tanstack.com/router/latest/docs/guide/preloading#preloading-with-external-libraries)
- [TanStack Query: Prefetching and Router Integration](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching#router-integration)
- [TanStack Query: queryOptions](https://tanstack.com/query/latest/docs/framework/react/reference/queryOptions)
- [TanStack Query: QueryClient.ensureQueryData](https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientensurequerydata)
