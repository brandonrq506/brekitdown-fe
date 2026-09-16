# Route Documentation

- Ensure we always set a `title` in the `head` property of the route.
- Ensure the title includes `| Brekitdown` at the end of the title.

## Tanstack Router

It is a best practice to add a loader to the `index.tsx` file, instead of the `route.tsx` file. This is to have the loader and the data available for exactly thinks like using the data to render the `title`.

## Route-level page composition

Pages are route-level composition boundaries. A page may combine reusable UI from several
features to present everything relevant to that route. Do not place a page component inside one
feature's `components` directory when doing so would make that feature depend on sibling features.

Co-locate route-only components, tests, and utilities with their route. Prefix non-route files and
folders with `-` so TanStack Router's file generator ignores them:

```text
src/routes/_protected/goals/
├── index.tsx
├── $goalId/
│   └── index.tsx
└── -components/
    ├── goals-index-page.tsx
    └── goals-index-page.spec.tsx
```

The dependency direction should be:

```text
route page → feature components → shared components
```

- Route pages may import components from multiple features.
- Feature components may import shared components and code owned by their own feature.
- A feature must not import a route page or depend on another feature merely to assemble a page.
- Keep a component in the route's `-components` folder while it is specific to that page.
- Move a component into a feature only when it becomes reusable and has a clear feature owner.

Use local relative imports for route-co-located files and the existing path aliases for feature and
shared modules:

```ts
import { GoalsIndexPage } from "./-components/goals-index-page";
import { goalQueries } from "@/features/goals/api/queries";
```
