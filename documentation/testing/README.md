# Testing documentation hub

Two layers:

- **Philosophy (what to test, one behavior per test, readability)** lives in the `tester` agent at [`.claude/agents/tester.md`](../../.claude/agents/tester.md). It is the authoritative statement of intent; humans should read it too.
- **Library how-to (hard skills)** lives in the guides below. Read only the ones the test at hand needs.

## Which guide, when

| Guide                                                                                                                 | Read when                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [React Testing Library](react-testing-library-guide.md)                                                               | Always. Canonical pattern, query types and priority, `screen`/`within`, async waits, `renderHook` policy, manual lint rules.         |
| [user-event](user-event-guide.md)                                                                                     | The test contains any interaction (click, type, keyboard, upload, clipboard).                                                        |
| [jest-dom](jest-dom-guidelines.md)                                                                                    | Every assertion. Presence vs visibility, semantic state matchers, accessibility contract, manual lint rules.                         |
| [MSW](msw-guidelines.md)                                                                                              | The subject fetches or mutates. Handler shape, `server.use` overrides, error/empty/pending scenarios, "test outcomes, not requests". |
| [React Hook Form § Test user-visible form behavior](../react-hook-form-guidelines.md#test-user-visible-form-behavior) | The subject is a form.                                                                                                               |
| [TanStack Query § Testing the integration](../tanstack-query-axios-guidelines.md#testing-the-integration)             | The subject is a query factory, query function, or mutation module.                                                                  |

## Test infrastructure map

| File                                                      | Provides                                                                                                                                                       | Consequence for a test                                                                                                                      |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/test/test-utils.ts`                                  | `render` wrapped in providers; re-exports everything from `@testing-library/react`. Returns `{ ...rtlResult, queryClient, router }`. Accepts `initialEntries`. | Import `render`, `screen`, `within`, `waitFor`, `renderHook` from `@/test/test-utils`, never from `@testing-library/react`.                 |
| `src/test/test-providers.tsx`                             | Fresh `QueryClient` per render with `retry: false`; real TanStack Router over the generated `routeTree` with memory history.                                   | No shared cache between tests. Navigation can be asserted via `router.state.location`.                                                      |
| `src/test/setup.ts`                                       | Loads jest-dom matchers; starts MSW with `onUnhandledRequest: "error"`; `server.resetHandlers()` after each test.                                              | Any request without a handler fails the test. Declare handlers with `server.use(...)` inside the test that needs them.                      |
| `src/test/server.ts`                                      | `server = setupServer()` with **no baseline handlers** (TODO in file).                                                                                         | Build URLs from `api.defaults.baseURL` + the endpoint constant exported by `@/libs/axios`.                                                  |
| `vite.config.ts` → `test`                                 | `globals: true` (`it`, `expect`, `vi` available), `environment: "jsdom"`, `TZ: "UTC"`, `clearMocks`, `unstubEnvs`, `unstubGlobals`.                            | Pin timestamps in fixtures; no clock mocking needed for date formatting.                                                                    |
| `vite.config.ts` → lint override for `**/*.spec.{ts,tsx}` | `no-magic-numbers` off, `max-lines-per-function` 200.                                                                                                          | The glob matches any directory, so `__tests__/foo.spec.tsx` gets the relaxations. A `foo.test.tsx` file would NOT. Keep the `.spec` suffix. |

## Conventions in one glance

- Test file: `foo.spec.tsx` (or `.spec.ts` for utils) inside a `__tests__/` directory that is a sibling of `foo.tsx`: `components/foo.tsx` → `components/__tests__/foo.spec.tsx`, `utils/bar.ts` → `utils/__tests__/bar.spec.ts`. The `__tests__/` folder lives in the same parent as the subject, never higher. Relative imports therefore start with `../` (`import { Foo } from "../foo"`).
- Explicit imports from `vite-plus/test` when you need `vi`, `expectTypeOf` (lint rule `vite-plus/prefer-vite-plus-imports`).
- Run one file: `vp test src/path/to/__tests__/foo.spec.tsx`. Run everything: `vp test`. Lint/format/types: `vp check`.
