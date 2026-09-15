## MSW guidelines

### Canonical pattern

Use a typed response factory for both the successful baseline and test-specific
datasets.

```ts
import { http } from "msw";

import { apiRoutes } from "@/test/handlers/api-routes";
import { mockTasksResponse } from "@/test/handlers/tasks";
import { tasks } from "@/test/store/tasks";

export const taskHandlers = [http.get(apiRoutes.tasks, () => mockTasksResponse(tasks))];

// In the test that needs this dataset:
server.use(http.get(apiRoutes.tasks, () => mockTasksResponse([])));
```

Canonical entities and builders live in `src/test/store/`. Response envelopes belong
to the typed factories in `src/test/handlers/`, so the same entity can be used as a
component prop or returned by MSW. URL construction belongs in `api-routes.ts`.

### Keep baseline handlers small and successful

- Group handlers by API domain under `src/test/handlers/`.
- Keep only the deterministic happy path used by most tests.
- Keep fixtures and response factories typed and pure; never mutate fixtures from a handler.
- Put unusual datasets and network behavior in the test that needs them.

### Keep reusable mutations stateless

Mutation handlers are valid happy paths. Keep a shared one when many tests need the same fixed response; otherwise define it locally.

```ts
http.delete(apiRoutes.task(), () => new HttpResponse(null, { status: 204 }));
```

Do not mutate a shared mock store so later reads imitate Rails persistence:

```ts
// Avoid: creates a second implementation of the backend lifecycle.
http.post(apiRoutes.tasks, async ({ request }) => {
  tasks.push(await request.json());
  return HttpResponse.json(tasks.at(-1), { status: 201 });
});
```

### Return test data; do not reproduce Rails

```ts
// Preferred: the test owns the result it needs.
server.use(http.get(apiRoutes.tasks, () => mockTasksResponse([overdueTask])));

// Avoid: duplicates the Rails filter DSL and its edge cases.
http.get(apiRoutes.tasks, ({ request }) => {
  const filters = parseRailsFilters(new URL(request.url).searchParams);
  return HttpResponse.json(applyRailsFilters(allTasks, filters));
});
```

Do not reproduce Rails filtering, sorting, authorization, validation, or timezone behavior. Test those rules in Rails. Unit-test frontend query builders and serializers directly; give UI tests a fixed response.

### Override behavior in the test that needs it

Use `server.use(...)` for custom data, empty states, failures, latency, and races.

```ts
import { delay, HttpResponse, http } from "msw";

// Empty state.
server.use(http.get(apiRoutes.tasks, () => mockTasksResponse([])));

// HTTP failure: the server returned a response.
server.use(
  http.get(apiRoutes.tasks, () =>
    HttpResponse.json({ error: "Temporary failure" }, { status: 503 }),
  ),
);

// Network failure: no usable HTTP response exists.
server.use(http.get(apiRoutes.tasks, () => HttpResponse.error()));

// Only the next request fails; the baseline handles later requests.
server.use(
  http.get(
    apiRoutes.tasks,
    () => HttpResponse.json({ error: "Temporary failure" }, { status: 503 }),
    { once: true },
  ),
);

// Delay only when the test observes pending, timeout, cancellation, or a race.
server.use(
  http.get(apiRoutes.tasks, async () => {
    await delay(100);
    return mockTasksResponse(tasks);
  }),
);
```

Prefer `{ once: true }` for request sequences; do not maintain mutable counters.
Keep ordinary handlers immediate.

### Test outcomes, not intercepted requests

```ts
// Avoid: captures an implementation detail for a later assertion.
let capturedBody: unknown;
server.use(
  http.post(apiRoutes.goals, async ({ request }) => {
    capturedBody = await request.json();
    return mockGoalResponse(createdGoal, { status: 201 });
  }),
);
expect(capturedBody).toEqual(expectedBody);
```

When an integration test depends on a frontend-owned request contract, reject the specific invalid request and assert the application's observable result:

```ts
interface CreateGoalBody {
  goal: {
    name: string;
  };
}

interface ApiError {
  error: string;
}

server.use(
  http.post<never, CreateGoalBody, GoalResponse | ApiError>(
    apiRoutes.goals,
    async ({ request }) => {
      const body = await request.json();

      if (!body.goal.name) {
        return HttpResponse.json({ error: "Invalid goal payload" }, { status: 422 });
      }

      return mockGoalResponse(createdGoal, { status: 201 });
    },
  ),
);

expect(await screen.findByText("Goal created")).toBeVisible();
```

Validate only the contract relevant to the test; do not recreate broad Rails validation.

### Model responses accurately

```ts
mockTasksResponse(tasks); // Typed JSON response
new HttpResponse(null, { status: 204 }); // No Content: never attach a body
HttpResponse.json({ error: "Invalid task" }, { status: 422 }); // HTTP error
HttpResponse.error(); // Transport failure, not a server 4xx/5xx
```

Match the backend's status, body, and relevant headers. Do not invent response shapes for test convenience.

### Prefer inference; add generics only when they provide value

Prefer inference when a typed fixture or factory already protects the response:

```ts
const mockTasksResponse = (data: Task[]) => HttpResponse.json<TasksResponse>({ data });

http.get(apiRoutes.tasks, () => mockTasksResponse(tasks));
```

The first three handler generics are positional:

```ts
http.post<PathParams, RequestBody, ResponseBody>(path, resolver);
```

Use them for a typed `request.json()`, typed `params`, or explicit response enforcement when no typed factory protects that boundary:

```ts
// Typed request body and response.
http.post<never, CreateGoalBody, GoalResponse>(apiRoutes.goals, async ({ request }) => {
  const body = await request.json();
  return mockGoalResponse(buildGoal(body.goal));
});

// Typed path parameter and response.
http.get<{ goalReferenceXid: string }, never, GoalResponse>(apiRoutes.goal(), ({ params }) =>
  mockGoalResponse(buildGoal({ reference_xid: params.goalReferenceXid })),
);

// Explicit response enforcement without a typed factory.
interface TaskSummary {
  id: number;
  title: string;
}

http.get<never, never, TaskSummary[]>(apiRoutes.tasks, () =>
  HttpResponse.json([{ id: 1, title: "Plan the day" }]),
);
```

Once any positional generic is explicit, supply the response type when the resolver returns a body. Do not write `http.get<never, never, Response>()` when a typed fixture or factory provides equivalent safety. Never use `any`, broad casts, or assertions merely to silence handler errors.

### Do not introduce higher-order resolvers speculatively

Keep occasional behavior inline:

```ts
http.get(apiRoutes.tasks, async () => {
  await delay(100);
  return mockTasksResponse(tasks);
});
```

Do not add `withDelay`, `withAuth`, or another higher-order resolver based on this guide. Consider one only after meaningful cross-handler repetition exists, the abstraction is reviewed separately, it avoids Rails-owned behavior, and it preserves MSW's `HttpResponseResolver` generics.
