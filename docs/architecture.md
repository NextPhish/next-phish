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
- **UI:** Tailwind CSS v4 + `@next-phish/ui` (Radix, Downshift, TanStack Table); retained specialized PrimeReact editors and charts
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
│   │   │   │   │   ├── router.ts    # Root tRPC router (merges modules)
│   │   │   │   │   ├── context.ts   # tRPC context (injects auth session)
│   │   │   │   │   └── procedures.ts # publicProcedure, protectedProcedure
│   │   │   │   ├── modules/         # Domain modules (DDD)
│   │   │   │   │   └── <domain>/    # e.g. auth, user, campaign
│   │   │   │   │       ├── enums/   # Zod enums / TS const enums
│   │   │   │   │       ├── types/   # Domain-specific TS types
│   │   │   │   │       ├── services/ # @Service() business logic
│   │   │   │   │       ├── commands/ # Write operations (Zod-validated input)
│   │   │   │   │       ├── queries/  # Read operations (Zod-validated input)
│   │   │   │   │       ├── repositories/ # Prisma data access layer
│   │   │   │   │       └── transformers/ # class-transformer DTOs
│   │   │   │   └── lib/             # Shared server utilities
│   │   │   ├── components/          # Atomic design system
│   │   │   │   ├── atoms/           # Smallest UI primitives
│   │   │   │   ├── molecules/       # Composite components
│   │   │   │   ├── organisms/       # Complex sections
│   │   │   │   ├── templates/       # Page layouts
│   │   │   │   └── ui/             # PrimeReact re-exports / wrappers
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
│       ├── src/index.ts
│       ├── tsconfig.json
│       ├── Dockerfile
│       └── package.json
│
├── packages/
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
  apps/next-app  ──►  packages/database
  apps/next-app  ──►  packages/shared
  apps/static-server ──►  packages/database
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

### Database: Prisma

- PrismaClient is a singleton via `packages/database/src/client.ts` (guards against hot-reload instantiation).
- Schema changes via `pnpm db:migrate` (runs `prisma migrate dev` in the database package).
- Queries/repositories **select all fields by default**; transformers whittle down via class-transformer groups.

### Validation: Zod

- Every command, query, and tRPC procedure input is validated with Zod.
- Types are inferred from Zod schemas (no manual type duplication).
- Shared Zod schemas live in `packages/shared` and are consumed by tRPC procedures and workers.

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

### Frontend: PrimeReact + Atomic Design

- PrimeReact components are wrapped in `apps/next-app/src/components/ui/` for theme consistency.
- Atomic hierarchy: `atoms → molecules → organisms → templates → pages`.
- Pages compose templates (or organisms directly for simple layouts).

### Worker

- Lives in `apps/worker/`, deployed as an independent container.
- Processes BullMQ jobs from Redis.
- Shares business logic via `packages/shared` and database access via `packages/database`.

## V1 UI foundation (September 2026)

`packages/ui` (`@next-phish/ui`) contains the selected V1 design system: React 19, Radix primitives, Downshift autocomplete, Tailwind v4 and TanStack Table v8. Storybook runs independently inside the package. Its runtime exports are presentation-only and have no dependency on Next.js, tRPC, auth or database packages. The shared schemas and Formik are used only by demonstration stories.

Login (including magic links), password recovery, two-factor verification, initial setup, organization onboarding, the authenticated application shell, the home dashboard, tasks board and user profile now consume the V1 package. Profile includes general settings, password and authenticator management, API keys and the existing notifications placeholder. API keys use the shared DataTable through an application adapter. The shell keeps a dark content boundary for routes awaiting migration; the dashboard, tasks and profile use the light V1 workspace. Adopt the new package through application adapters and page-level migration; do not replace the existing AppDataTable before mapping its callbacks and permission-aware actions. See [UI library plan](ui-library-plan.md) and [package documentation](../packages/ui/README.md).

Task forms use V1 controls and dialogs. The rich-text description editor remains an isolated PrimeReact Editor with V1 styling until a shared rich-text component is available. Task board previews and loading states live in Storybook. Tasks can be moved between visible status columns with a drag handle using a pointer, touch or keyboard (Space/Enter, arrow keys, Escape). The board uses `@dnd-kit/core` and the existing task move mutation; unsuccessful saves retain the original task status, and the status select remains available as an alternative.

Schedule overview, create/edit forms and details use the light V1 workspace. The schedule table adapts the shared DataTable to server filtering, sorting and pagination; containers retain tRPC mutations and Formik submission. Delivery health uses compact metrics with the shared Radix-based HelpPopover. The timeline retains its existing PrimeReact Chart wrapper around Chart.js with V1 colors. Schedule forms, populated details and help popovers have independent Storybook previews; regression tests mock network mutations.

Organization list, details, member tables and organization settings also use V1 components. Role filters and sorting remain server-side, and deletion eligibility uses the total owned-organization count rather than the current page. Settings preserve role restrictions and use shared dialogs and localized schema validation. Organization analytics opt into the V1 chart presentation while keeping all original series and chart interactions; the default chart variant remains available to legacy screens. Global ignored-network settings reuse the V1 organization network presentation through an admin-only adapter; their queries and mutations remain globally scoped under settings.

Pages use the V1 server table, forms, redirect catalog and import dialog. Containers retain Formik, tRPC and navigation; the import URL schema is shared with the backend. GrapesJS remains the specialized editor. Catalog thumbnails and sandboxed HTML previews work in the application and standalone Storybook. Mocked regression tests cover list controls, redirects, imports and create/update payloads.

Email templates use the V1 server table and form presentation with the specialized GrapesJS editor supplied by the container. Shared TagInput and FileUploader controls preserve tags and attachments; upload/removal failures remain visible and pending attachment changes block saving. Standalone stories render the actual form presentation, and mocked tests cover query mapping, validation and attachment payloads.

Sending profiles use V1 provider forms, dialogs and server tables. Provider filters reach the repository query; masked secrets are preserved when editing existing profiles. The form serializes only known boolean and numeric provider fields, preserving credentials as strings.

Target groups use V1 lists, recipient forms and import dialogs. Formik owns import mode and the selected file, while the import hook tracks upload/job progress. Admin user management uses the same table and dialog primitives with the existing admin guard, shared server validation and a current deletion preview before destructive actions.

Campaigns use V1 authoring tabs, asset catalogs, lifecycle actions and recipient tables. Error summaries reveal invalid fields across tabs. Recipient timeline queries remain in containers; the server-paginated recipient table hides unsupported search. Charts retain the specialized Chart.js wrapper. All migrated menu sections have a light workspace boundary and English/Bulgarian translation coverage tests.

### Two-factor enrollment

BetterAuth's `twoFactorOptions` requires a verified TOTP code before enabling two-factor sign-in. Starting or abandoning setup must leave password sign-in available. The Prisma `TwoFactor` model includes the installed plugin's failed-attempt counter and lockout timestamp; apply database migrations and regenerate Prisma when upgrading the plugin. `pnpm --filter @next-phish/next-app test:auth` exercises pending, rejected, storage-failed and successful enrollment against an isolated in-memory BetterAuth instance; it never changes real accounts.

## Production packaging

Use `Dockerfile.production` and `docker-compose.production.yml` for production. Next.js emits standalone output; worker and content server builds use `scripts/build-service.mjs` to bundle workspace TypeScript into runnable CommonJS artifacts. Prisma and BullMQ remain external runtime dependencies. `pnpm build:production` builds only deployable services, and `pnpm start` runs existing artifacts without a Turbo build dependency. The development entry point loads the root `.env` with Node and passes it through Turbo's uncached loose mode. See [deployment](deployment.md) and [local setup](setup.md).
