# Coding Standards

## State Management

### Simple form status (error/success)

Use the `useFormStatus` hook from `src/hooks/use-form-status.ts` instead of separate `useState` calls for `error` and `success` strings.

```tsx
// Bad
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

// Good
const { status, setError, setSuccess, reset } = useFormStatus();
```

Display status messages with discriminated union checks:

```tsx
{
  status.type === "error" && (
    <FormMessage variant="error">{status.message}</FormMessage>
  );
}
{
  status.type === "success" && (
    <FormMessage variant="success">{status.message}</FormMessage>
  );
}
```

### Complex multi-step state

Use `useReducer` with a custom hook when a component has:

- 3+ related state variables
- A `reset()` function that clears multiple state values
- State transitions that depend on current state

Extract the reducer and hook into the owning component’s `hooks/` folder. Use feature-level `hooks/` for sibling consumers and `src/hooks/` only for cross-feature reuse.

Expose semantic actions instead of raw dispatch:

```tsx
// Bad
dispatch({ type: "SET_STEP", step: "done" });
dispatch({ type: "SET_SUCCESS", message: "Done!" });

// Good
complete("Done!");
```

### Debouncing

Debounce API calls triggered by user input using `useRef` + `setTimeout`:

```tsx
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const debouncedCheck = useCallback((value: string) => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  if (!value) return;

  timeoutRef.current = setTimeout(async () => {
    // API call here
  }, 300);
}, []);
```

## Server Components & Pages

### Database access requires `force-dynamic`

Any page or layout that queries the database (directly or via tRPC/betterAuth) must opt out of static generation:

```tsx
export const dynamic = "force-dynamic";
```

Without this, Next.js tries to prerender the page at build time, which fails because no database is available in CI. This applies to any server component that calls Prisma, `auth.api.getSession()`, or a tRPC caller.

Currently there are no public-facing pages that need SEO/static generation, so `force-dynamic` is safe to use everywhere. If a public page is added later that needs static rendering, it must not query the database directly — use client-side fetching or ISR instead.

### Loading states with `loading.tsx`

Use Next.js `loading.tsx` files to show skeleton UI while server components fetch data. Next.js automatically wraps the page in `<Suspense>` when this file exists.

- Use `Skeleton` from `@next-phish/ui` in migrated V1 screens, including table rows and asynchronously loaded lists. Existing PrimeReact screens may retain their skeletons until migration.
- Match the layout structure of the actual page (same dimensions, spacing)
- Place `loading.tsx` alongside the `page.tsx` it covers

```tsx
import { Skeleton } from "@next-phish/ui";

export default function Loading() {
  return (
    <div className="np-theme p-6" role="status" aria-label="Loading…">
      <Skeleton className="mb-6" style={{ width: "40%", height: "2rem" }} />
      <Skeleton style={{ width: "100%", height: 200, borderRadius: "1rem" }} />
    </div>
  );
}
```

Every route that queries the database (layouts or pages) should have a corresponding `loading.tsx`.

## Forms

### Always use Formik + Zod

All forms must use Formik for form state and Zod for validation. Do not use raw `useState` for form fields.

- Define Zod schemas in `packages/shared/src/schemas/`
- Use `toFormikValidation()` from `src/lib/to-formik-validation.ts` to convert Zod schemas for Formik's `validate` prop
- Use Formik's `<Form>`, `<Field>`, `<ErrorMessage>` components

```tsx
import { Formik, Form, Field, ErrorMessage } from "formik";
import { mySchema } from "@next-phish/shared";
import { toFormikValidation } from "@/src/lib/to-formik-validation";

<Formik
  initialValues={{ email: "" }}
  validate={toFormikValidation(mySchema)}
  onSubmit={handleSubmit}
>
  {({ isSubmitting }) => (
    <Form>
      <Field name="email" />
      <ErrorMessage name="email" component="p" />
      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </Form>
  )}
</Formik>;
```

## Frontend Component Structure

### Ownership and naming

Keep the existing Atomic Design layers (`atoms`, `molecules`, `organisms`, `templates`). Inside a feature, give each substantial component its own kebab-case folder and a descriptive main file. Use PascalCase component names without `Container` or `Presentation` suffixes. This convention replaces the former mandatory container/presentation file pair.

```text
src/components/organisms/organizations/
  organization-list/
    index.ts
    organization-list.tsx
    hooks/
      use-organization-list.ts
    types/
      organization-list.types.ts
    parts/
      organization-list-view.tsx
      organization-list-toolbar.tsx
```

- **Main component**: owns or composes business orchestration, permissions, navigation, query/mutation hooks, and providers. Keep its JSX short: providers and a small number of named parts. Move complex rendering into `parts/`.
- **`hooks/`**: component-owned state and orchestration hooks. Extract substantial logic or related state transitions here; do not create a hook just to relocate a trivial expression. Expose meaningful data and semantic callbacks.
- **`parts/`**: private rendering components, fields, sections, and table column definitions. Accept typed data/callbacks and consume Formik context as needed. Do not fetch data, navigate imperatively, or make authorization decisions here. Presentation state, formatting, translations, and declarative links are allowed.
- **`types/`**: types used by several files of the component. Keep single-file props beside their component. Infer domain/form types from existing DTOs, router outputs, or Zod schemas instead of copying them. Use `import type` for type-only dependencies.
- **`index.ts`**: export the intended public component and intentionally shared types. Runtime consumers outside the component use its public entry. Internal files import each other directly, not through their own barrel, to avoid cycles. Tests and Storybook may import parts deliberately to exercise rendering without backend providers.

Create folders only when they contain useful code. Simple controls may remain a single component file; a one-line fragment does not need its own part. A substantial dialog or form with an independent lifecycle should own its own component folder rather than become an unrelated sibling file in another component's `parts/`.

Keep code at the nearest common owner. A hook used only by one component lives in its `hooks/`; a hook shared by sibling components can live in their feature's `hooks/`. Truly cross-feature hooks stay in `src/hooks/`. Apply the same ownership rule to shared types and utilities. Reusable application-independent UI belongs in `@next-phish/ui`.

### Logic and rendering

A main component can delegate substantial orchestration to a local hook:

```tsx
// organization-list/organization-list.tsx
"use client";

import { useOrganizationList } from "./hooks/use-organization-list";
import { OrganizationListView } from "./parts/organization-list-view";

export function OrganizationList() {
  const model = useOrganizationList();
  return <OrganizationListView {...model} />;
}
```

Use explicit typed props or a cohesive view model. Do not pass raw mutation objects or entire provider contexts when a few data fields and callbacks are sufficient. Split large views into meaningful sections, such as a toolbar, table, and confirmation dialog; each file should have a clear rendering responsibility.

Keep pages server-first and `"use client"` at interactive entry points. The directory structure does not define the server/client boundary. Never import server implementation code into a client hook; type-only domain imports are allowed.

### Forms

- The main form component owns `<Formik>` with shared Zod validation and its submission callback, either defined locally or supplied by its local hook.
- Form parts read field state with `useFormikContext()` and render `<Form>`, fields, and errors. They do not create a second Formik provider or duplicate field state in `useState`.
- Keep error/success handling in `useFormStatus` and complex workflows in reducer-based semantic hooks.
- Keep permission decisions and mutation payload construction in orchestration. Pass allowed actions or capability flags to rendering parts and retain backend authorization checks.

### Styling

Use Tailwind for ordinary layout, spacing, typography, responsive behavior, and common states. V1 screens use the tokens defined in `packages/ui/src/styles.css` under `.np-theme`; follow [brand guidelines](brand.md).

Do not create CSS modules merely to alias utilities such as `flex`, `gap-4`, or `text-sm`. Colocate exceptional `<component-name>.module.css` files with their owner for custom selectors, third-party DOM integration (such as GrapesJS), or complex animations where utilities are insufficient. A part can own its own module if those styles are exclusive to it. Shared theme tokens and reusable UI behavior stay in the UI package.

When converting existing CSS, preserve exact sizing, weights, breakpoints, hover/focus behavior, and scoped child selectors. Extract repeated semantic UI into shared components instead of collecting opaque class-string constants. Do not change the visual design as a side effect of reorganizing files.

### Migration and validation

Apply this convention to new components and complete migration slices. Existing unmigrated `container`/`presentation` files can remain until their feature is migrated; do not add new uses of that naming. Move routes, barrel exports, Storybook stories, tests, and any mocks together, and remove obsolete paths rather than leaving permanent compatibility wrappers.

Run affected package type checks, regression tests, lint, and React Doctor. For CSS conversions, verify representative views in the browser, including narrow layouts and keyboard interactions. Preserve server query mapping, form validation, mutation payloads, permissions, loading/error states, and table actions. Migration progress is tracked in [issue #28](https://github.com/NextPhish/next-phish/issues/28).

## Client-Side Data Fetching

### Use tRPC + React Query

All client-side data fetching must go through tRPC with React Query. This provides loading states, caching, and query invalidation out of the box.

- tRPC client is in `src/lib/trpc.ts`
- `TRPCProvider` wraps the app in `app/layout.tsx`
- Use `trpc.<router>.<procedure>.useQuery()` for reads
- Use `trpc.<router>.<procedure>.useMutation()` for writes
- Invalidate queries after mutations with `utils.<router>.<procedure>.invalidate()`

### Custom hooks wrap tRPC queries

Wrap tRPC queries in domain-specific hooks that expose a clean API. Place component-owned hooks in the component’s `hooks/` folder; use feature-level or `src/hooks/` folders only when consumers share that ownership. For example, a cross-feature organization hook can remain in `src/hooks/`:

```tsx
// src/hooks/use-my-organizations.ts
export function useMyOrganizations() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.organization.list.useQuery({ limit: 50 });
  const create = trpc.organization.create.useMutation({
    onSuccess: () => utils.organization.list.invalidate(),
  });

  return { organizations: data?.organizations ?? [], isLoading, create };
}
```

### Backend module structure

Follow DDD patterns for new backend modules in `packages/backend/src/<domain>/`:

```
organization/
├── repositories/         # Prisma data access (raw queries)
├── services/             # Transformation logic (unit testable)
├── queries/              # Read operations (IQueryHandler)
├── commands/             # Write operations (ICommandHandler)
├── types/                # TypeScript interfaces
├── validations/          # Zod schemas
├── index.ts              # Public exports
└── <domain>-service.provider.ts  # TypeDI registration
```

- **Repository** — raw Prisma queries, returns domain types
- **Service** — transforms raw data to view types (e.g., `$me` membership)
- **Query** — orchestrates repository + service, registered via TypeDI
- **Command** — write operations, registered via TypeDI
- **tRPC router** — calls queries/commands via message bus
