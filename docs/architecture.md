# Architecture

## Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript (strict)
- **Database:** PostgreSQL + Prisma (migrations, client)
- **Auth:** BetterAuth (Prisma adapter)
- **API Layer:** tRPC (type-safe endpoints)
- **Validation:** Zod
- **DI:** TypeDI (constructor-based injection)
- **Serialization:** class-transformer (`@Expose`/`@Exclude` + groups)
- **Queue:** BullMQ + Redis (background jobs)
- **Static Server:** Hono (lightweight companion for public/redirect pages)
- **UI:** Tailwind CSS v4 + `@next-phish/ui` (Radix, Downshift, TanStack Table, React DayPicker); Recharts for charts and Editor.js for task descriptions
- **Lint:** ESLint (next config)
- **Monorepo:** Turborepo + pnpm workspaces
- **Package Manager:** pnpm

## Project Structure

```
next-phish/
├── apps/
│   ├── next-app/                    # Next.js (web + tRPC backend)
│   │   ├── app/
│   │   │   ├── (auth)/login/        # Login page (server component)
│   │   │   ├── (auth)/register/     # Register page (server component)
│   │   │   ├── api/auth/[...all]/
│   │   │   │   └── route.ts         # BetterAuth HTTP handler
│   │   │   ├── api/trpc/[trpc]/
│   │   │   │   └── route.ts         # tRPC HTTP handler
│   │   │   ├── layout.tsx           # Root layout
│   │   │   └── page.tsx             # Home page
│   │   ├── src/
│   │   │   ├── server/
│   │   │   │   ├── auth.ts          # BetterAuth instance + config
│   │   │   │   ├── queue.ts         # BullMQ connection + queue/worker factories
│   │   │   │   ├── container.ts     # TypeDI global container setup
│   │   │   │   ├── trpc/
│   │   │   │   │   ├── router.ts    # Root tRPC router
│   │   │   │   │   ├── context.ts   # tRPC context (injects auth session)
│   │   │   │   │   ├── procedures.ts # Auth and permission middleware
│   │   │   │   │   └── routers/     # One <domain>.router.ts adapter per domain
│   │   │   │   └── lib/             # Shared server utilities
│   │   │   ├── components/          # Atomic design system
│   │   │   │   ├── atoms/           # Smallest UI primitives
│   │   │   │   ├── molecules/       # Composite components
│   │   │   │   ├── organisms/       # Complex sections
│   │   │   │   ├── templates/       # Page layouts
│   │   │   │   └── providers/      # Application query/context providers
│   │   │   └── lib/                 # Shared client/server utilities
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── postcss.config.mjs
│   │   ├── eslint.config.mjs
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── static-server/               # Hono (serves landing pages from DB)
│   │   ├── src/index.ts
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── worker/                      # BullMQ background job processor
│       ├── src/
│       │   ├── index.ts            # Entry point and process signals
│       │   ├── application.ts      # Startup and graceful shutdown
│       │   ├── config.ts           # Validated worker environment settings
│       │   ├── logger.ts           # Structured Pino logging
│       │   ├── queues.ts           # Queue clients and shared job options
│       │   ├── schedulers.ts       # Periodic job registration
│       │   ├── workers/            # Worker factory, logging and registration
│       │   └── processors/         # Handlers grouped by domain
│       ├── tsconfig.json
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── backend/                     # Shared server domain modules
│   │   └── src/<domain>/
│   │       ├── commands/            # ICommandHandler write operations
│   │       ├── queries/             # IQueryHandler read operations
│   │       ├── repositories/        # Prisma data access
│   │       ├── services/            # Domain logic
│   │       ├── validations/         # Named server input schemas
│   │       └── types/               # Domain types
│   │
│   ├── database/                    # Prisma schema + generated client
│   │   ├── prisma/schema.prisma     # Database models
│   │   ├── src/client.ts            # PrismaClient singleton
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── shared/                      # Shared types, Zod schemas, utilities
│       ├── src/
│       ├── tsconfig.json
│       └── package.json
│
├── docker/
│   └── docker-compose.yml           # Multi-service compose (postgres, redis, next-app, static-server, worker)
├── turbo.json                       # Turborepo pipeline config
├── pnpm-workspace.yaml              # Workspace definition (apps/*, packages/*)
├── tsconfig.base.json               # Shared TypeScript config
├── package.json                     # Root: dev tooling + convenience scripts
├── commitlint.config.cjs
├── .husky/
│   ├── pre-commit                   # Runs lint-staged
│   └── commit-msg                   # Runs commitlint
├── docs/
│   └── architecture.md
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

## Monorepo Conventions

### Package layout

- **`apps/*`** — independently deployable applications. Each has its own `package.json`, `tsconfig.json`, `Dockerfile`, and exposes no public API to other packages (they are end-points).
- **`packages/*`** — shared libraries consumed by apps via `workspace:*` protocol (e.g. `"@next-phish/database": "workspace:*"`). They have no Dockerfiles and are not deployed standalone.

### Dependency flow

```
  apps/next-app  ──►  packages/backend
  apps/next-app  ──►  packages/database
  apps/next-app  ──►  packages/shared
  apps/static-server ──►  packages/backend
  apps/static-server ──►  packages/database
  apps/worker    ──►  packages/backend
  apps/worker    ──►  packages/database
  apps/worker    ──►  packages/shared
```

No circular dependencies between packages.

### Node.js SDK

`packages/sdk` is the publishable `@next-phish/sdk` ESM client for PAT-scoped tRPC queries and mutations. It uses `x-api-key` authentication and SuperJSON. Callers pass an explicit `organizationId` for scoped operations. See [SDK usage and publishing](../packages/sdk/README.md).

The SDK's build reads the app router's types to generate a standalone wire contract. This is a build-time exception to the app boundary: it does not import or execute application code at runtime. The npm package contains no private workspace dependencies. SDK contract tests check generated inputs and outputs against the app router, and SDK Turbo tasks include server/package source files as cache inputs because this dependency is not represented by a workspace runtime dependency.

### Root scripts

All common operations run from the project root via `turbo`. Examples:

| Command           | Behaviour                                       |
| ----------------- | ----------------------------------------------- |
| `pnpm dev`        | Runs all apps in parallel (dev mode)            |
| `pnpm build`      | Builds all packages + apps                      |
| `pnpm lint`       | Lints all packages                              |
| `pnpm typecheck`  | TypeScript checks all packages                  |
| `pnpm db:migrate` | Runs Prisma migrations (in `packages/database`) |
| `pnpm db:studio`  | Opens Prisma Studio                             |
| `pnpm format`     | Prettier across the entire repo                 |

## Principles

### Pages: server-first

- Pages are **server components** by default.
- Only interactive islands (forms, live updates) use `"use client"`.
- Data flows: `server component → tRPC caller (RSC-compatible) → render`.

### API: tRPC + BetterAuth

- Every route is a tRPC procedure (no raw API routes for business logic).
- `publicProcedure` — no auth required.
- `protectedProcedure` — requires valid BetterAuth session (injected via context).
- BetterAuth routes live at `/api/auth/*` as a single catch-all handler.
- Domain routers live directly in `apps/next-app/src/server/trpc/routers/`. They adapt authenticated context to backend calls; domain commands, queries and validation schemas live in `packages/backend/src/<domain>/`. Do not recreate app-level domain folders around a single router.
- The client tRPC provider isolates React Query caches by signed-in user and active organization. Switching either scope creates a fresh query client and remounts consumers/subscriptions, including procedures whose organization is inferred from the session. Previous-scope queries are cancelled and their cache is discarded.

### Database: Prisma

- PrismaClient is a singleton via `packages/database/src/client.ts` (guards against hot-reload instantiation).
- Schema changes via `pnpm db:migrate` (runs `prisma migrate dev` in the database package).
- Queries/repositories **select all fields by default**; transformers whittle down via class-transformer groups.

### Validation: Zod

- Every command, query, and tRPC procedure input is validated with Zod.
- Types are inferred from Zod schemas (no manual type duplication).
- Schemas shared with client forms or workers live in `packages/shared`. Server operation schemas live in backend domain `validations/` and are exported through `@next-phish/backend`; routers reference named schemas instead of defining or extending them inline.

### Dependency Injection: TypeDI

- `@Service()` decorates services, commands, queries, repositories.
- Constructor injection for dependencies (Prisma client, repositories, other services).
- Container is pre-wired in `apps/next-app/src/server/container.ts`.

### Serialization: class-transformer

- Transformers define DTO classes with `@Expose()` / `@Exclude()`.
- `@SerializeOptions({ groups: ['admin', 'self'] })` controls visibility per context.
- Repositories return raw Prisma objects; transformers map them to DTOs before procedure output.

### Static Server: Hono

- Lives in `apps/static-server/`, deployed as an independent container on port `3001`.
- All routes resolve at `/` — looks up the request path in the `Page` Prisma model and returns the stored HTML.
- Health check endpoint at `/health`.
- Keeps public/phishing landing pages off the Next.js server, prevents session/CSRF leaks.

### Frontend: shared UI + component ownership

- `@next-phish/ui` is the application-independent design system (React, Radix, Tailwind, and TanStack Table). Use shared V1 UI, Recharts for application charts, and Editor.js for task descriptions. PrimeReact, PrimeIcons, Quill, and Chart.js are no longer dependencies.
- Keep the Atomic Design hierarchy: `atoms → molecules → organisms → templates → pages`. Pages compose public feature components or templates.
- Give each substantial component a folder containing its named main component, `index.ts`, private rendering `parts/`, component-owned `hooks/`, and shared local `types/` as needed. Do not use `Container`/`Presentation` filenames or component suffixes for new or migrated code.
- Main components and their hooks own orchestration, Formik, tRPC, permissions, and navigation. Rendering parts receive data/callbacks and may use Formik context. Main JSX stays small.
- Runtime consumers import public entries; internal files use direct imports. Shared code lives at its nearest common owner, and `src/hooks/` is reserved for cross-feature hooks. Tests and stories may deliberately render private parts.
- Prefer Tailwind for ordinary component styles. Keep exceptional CSS modules colocated with their component, particularly for third-party selectors or complex animations. Preserve `.np-theme` tokens and existing appearance during migration.
- See [frontend component conventions](coding-standards.md#frontend-component-structure) for the exact structure, form rules, and migration checks. [Issue #28](https://github.com/NextPhish/next-phish/issues/28) tracks incremental adoption; legacy names outside migrated areas remain temporarily.

### Worker

- Lives in `apps/worker/`, deployed as an independent container.
- Processes BullMQ jobs from Redis.
- Shares business logic via `packages/shared` and database access via `packages/database`.

Campaign execution is implemented in `packages/backend` and hosted by the worker. PostgreSQL owns schedules, occurrences, recipient state and transactional outbox records; BullMQ/Redis executes asynchronous jobs. See the [technical scheduling and delivery design](scheduling-and-delivery.md) for transaction boundaries, queue contracts, state machines and failure windows, and the [delivery operations runbook](delivery-operations.md) for configuration, diagnostics and recovery. The [public explanation](../apps/docs/src/content/docs/concepts/scheduling-and-delivery.md) intentionally omits most implementation details.

## V1 UI foundation (September 2026)

`packages/ui` (`@next-phish/ui`) contains the selected V1 design system: React 19, Radix primitives, Downshift autocomplete, Tailwind v4 and TanStack Table v8. Storybook runs independently inside the package. Its runtime exports are presentation-only and have no dependency on Next.js, tRPC, auth or database packages. The shared schemas and Formik are used only by demonstration stories.

Calendar controls use React DayPicker through shared `Calendar`, `DatePicker`, `TimePicker`, and `DateTimePicker` components. Month/year navigation uses themed Radix selects. Time inputs use a themed popup with separate hour/minute columns and explicit Cancel/OK actions; draft changes are applied only on confirmation. Popovers use Radix focus handling, and the app supplies the English/Bulgarian locale. Date-only filters retain local dates; campaign, schedule, and task forms retain their local date-time strings and perform their existing time-zone conversion when building payloads. Specialized chart timelines are visualization components, not date-input calendars.

Login (including magic links), password recovery, two-factor verification, initial setup, organization onboarding, the authenticated application shell, the home dashboard, tasks board and user profile now consume the V1 package. Profile includes general settings, password and authenticator management, API keys and the existing notifications placeholder. API keys use the shared DataTable through an application adapter. The shell keeps a dark content boundary for routes awaiting migration; the dashboard, tasks and profile use the light V1 workspace. Adopt the new package through application adapters and page-level migration; do not replace the existing AppDataTable before mapping its callbacks and permission-aware actions. See [UI library plan](ui-library-plan.md) and [package documentation](../packages/ui/README.md).

Task forms use V1 controls and dialogs. Descriptions use a client-only Editor.js block editor with paragraph, header, and list tools. The shared schema stores a versioned block document in nullable PostgreSQL JSONB; old HTML descriptions are cleared by the pre-release migration. Sanitize inline formatting before loading or saving blocks, and flush the editor before form submission. Task board previews and loading states live in Storybook. Tasks can be moved between visible status columns with a drag handle using a pointer, touch or keyboard (Space/Enter, arrow keys, Escape). The board uses `@dnd-kit/core` and the existing task move mutation; unsuccessful saves retain the original task status, and the status select remains available as an alternative.

Schedule overview, create/edit forms and details use the light V1 workspace. The schedule table adapts the shared DataTable to server filtering, sorting and pagination; main components and their hooks retain tRPC mutations and Formik submission. Delivery health uses compact metrics with the shared Radix-based HelpPopover. The timeline uses a Recharts range bar chart with V1 colors and links to the represented schedules and campaigns. Schedule forms, populated details and help popovers have independent Storybook previews; regression tests mock network mutations.

Organization list, details, member tables and organization settings also use V1 components. Role filters and sorting remain server-side, and deletion eligibility uses the total owned-organization count rather than the current page. Settings preserve role restrictions and use shared dialogs and localized schema validation. Organization analytics opt into the V1 chart presentation while keeping all original series and chart interactions; the default chart variant remains available to legacy screens. Global ignored-network settings reuse the V1 organization network presentation through an admin-only adapter; their queries and mutations remain globally scoped under settings.

Pages use the V1 server table, forms, redirect catalog and import dialog. Main components and their hooks retain Formik, tRPC and navigation; the import URL schema is shared with the backend. GrapesJS remains the specialized editor. Catalog thumbnails and sandboxed HTML previews work in the application and standalone Storybook. Mocked regression tests cover list controls, redirects, imports and create/update payloads.

Email templates use component-owned list, form, attachment, and variable-panel folders. Their local hooks coordinate state and requests, while private parts render V1 controls; the form main supplies the specialized GrapesJS editor. Shared TagInput and FileUploader controls preserve tags and attachments; upload/removal failures remain visible and pending attachment changes block saving. Standalone stories render the actual form parts, and mocked tests cover query mapping, validation and attachment payloads.

Sending profiles own separate list, form, and test-email-dialog folders with local orchestration hooks and private rendering parts. Provider filters reach the repository query; masked secrets are preserved when editing existing profiles. The form serializes only known boolean and numeric provider fields, preserving credentials as strings.

Target groups use V1 lists, recipient forms and import dialogs. Formik owns import mode and the selected file, while the import hook tracks upload/job progress. Admin user management owns user-list, create-user, and delete-user component folders and uses the same table and dialog primitives. Its server admin guard, shared validation, and current deletion preview checks remain in place; deletion state resets when the selected user changes.

Campaigns use V1 authoring tabs, asset catalogs, lifecycle actions and recipient tables. Error summaries reveal invalid fields across tabs. Recipient timeline queries remain in application orchestration; the server-paginated recipient table hides unsupported search. Charts use Recharts bar, pie, and timeline components. All migrated menu sections have a light workspace boundary and English/Bulgarian translation coverage tests.

### Two-factor enrollment

BetterAuth's `twoFactorOptions` requires a verified TOTP code before enabling two-factor sign-in. Starting or abandoning setup must leave password sign-in available. The Prisma `TwoFactor` model includes the installed plugin's failed-attempt counter and lockout timestamp; apply database migrations and regenerate Prisma when upgrading the plugin. `pnpm --filter @next-phish/next-app test:auth` exercises pending, rejected, storage-failed and successful enrollment against an isolated in-memory BetterAuth instance; it never changes real accounts.

## Production packaging

Use `Dockerfile.production` and `docker-compose.production.yml` for production. Next.js emits standalone output; worker and content server builds use `scripts/build-service.mjs` to bundle workspace TypeScript into runnable CommonJS artifacts. Prisma and BullMQ remain external runtime dependencies. `pnpm build:production` builds only deployable services, and `pnpm start` runs existing artifacts without a Turbo build dependency. The development entry point loads the root `.env` with Node and passes it through Turbo's uncached loose mode. See [deployment](deployment.md) and [local setup](setup.md).

### Organization member creation

Organization owners and administrators add members from the Members section of organization details, starting with an email lookup authorized by member-create permission for the requested organization. A new account requires a name and uses the existing welcome-email and initial-password lifecycle, with the global `user` role and organization `member` role. An existing account requires explicit confirmation before a separate server mutation rechecks the account and grants organization `member` access through BetterAuth. Existing-account membership does not change the account, password, or global role, and does not send a setup email. Disabled accounts and existing memberships are rejected.

Creation reports queue insertion failure separately from successful account creation. Pending, enabled members expose a retry-setup-email row action, and the same recovery is available immediately in the creation dialog. The resend endpoint rechecks membership, pending setup status, and enabled status before issuing a fresh setup token. Permission middleware must inspect Better Auth's `result.success` value rather than treating its response object as a boolean.
