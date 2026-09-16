# Local development

Run commands from the repository root unless a section says otherwise. This guide describes the current scripts, rather than a single-container Supervisor setup (which is no longer present).

## Prerequisites

- Node.js **24**, matching `.nvmrc`: `nvm install && nvm use` (or the equivalent in your version manager).
- pnpm **10.33.4**, matching `packageManager` in the root `package.json`. With a Corepack installation: `corepack enable && corepack prepare pnpm@10.33.4 --activate`.
- Docker Engine/Desktop with Docker Compose v2, running before infrastructure startup.
- Bash for repository scripts; use WSL2 on Windows.
- Available host ports: 3000, 3001, 5432, 6379, 1025, 1080; optionally 6006 for Storybook.

Check with `node --version`, `pnpm --version`, and `docker compose version`.

## First run

### 1. Install and configure

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm setup
```

Copy the example only if `.env` does not already exist. `pnpm setup` links the root `.env` to `packages/database/.env` for Prisma; it does not link environment files into the applications.

Edit `.env` before starting anything:

| Setting                                                     | Local value / action                                                                   |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`   | `localhost`, `5432`, `postgres`, `postgres`, `next_phish` for a new default database   |
| `DATABASE_URL`                                              | `postgresql://postgres:postgres@localhost:5432/next_phish`; Prisma reads this directly |
| `PORT`                                                      | `3000` for Next.js                                                                     |
| `STATIC_SERVER_PORT`                                        | `3001`                                                                                 |
| `APP_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS` | `http://localhost:3000`                                                                |
| `BETTER_AUTH_SECRET`                                        | Replace placeholder with `openssl rand -base64 32` output                              |
| `PAGE_SUBMISSION_ENCRYPTION_KEY`                            | Replace placeholder with `openssl rand -hex 32` output (64 hex characters)             |
| `DELIVERY_WEBHOOK_SECRET`                                   | Replace placeholder with independent `openssl rand -hex 32` output                     |
| `REDIS_HOST`, `REDIS_PORT`                                  | `localhost`, `6379`                                                                    |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`                     | `localhost`, `1025`, `false`; leave credentials empty                                  |
| `SMTP_FROM`                                                 | For example `no-reply@example.test`                                                    |
| `PUBLIC_CONTENT_URL`                                        | `http://localhost:3001`                                                                |
| `MESSAGE_ID_DOMAIN`                                         | A syntactically valid neutral domain, e.g. `mail.example.com` for local captured mail  |
| `R2_*`                                                      | A dedicated development Cloudflare R2 bucket and credentials                           |

Keep an existing database's credentials/name and encryption keys when updating an older checkout. Changing `DB_NAME` does not rename an existing database. URL-encode special characters in database credentials inside `DATABASE_URL`.

R2 is instantiated during service initialization: all four `R2_*` values must be nonempty even if you are only reviewing UI. Placeholder values are sufficient only for screens that do not access storage; uploads, attachments, imports and previews need a working bucket. There is no local filesystem storage provider configured.

### 2. Start infrastructure and apply migrations

```bash
docker compose up -d postgres redis fakesmtp
pnpm db:generate
pnpm db:migrate:deploy
```

Use `pnpm db:migrate:deploy` to apply committed migrations to your local database. Use `pnpm db:migrate` when intentionally creating a new migration for a schema change. `pnpm db:push` is not a replacement for versioned migrations.

There is currently no checked-in `packages/database/prisma/seed.ts`, despite the `db:seed` script being declared. Use the initial setup screen to create your first account instead.

### 3. Load the environment and start all application processes

`pnpm dev:up` loads the root `.env` using Node.js, starts the three infrastructure containers, links the Prisma environment file, and runs Turbo in loose environment mode so all three applications receive their settings:

```bash
pnpm dev:up
```

It runs **Next.js, the static server and the worker** in the foreground on your host. It does not start Storybook, install packages, generate Prisma or apply migrations. Restart it after changing `.env`.

Turbopack filesystem caching is disabled for development to prevent large persistent caches during long sessions. Compilation still uses memory caching; the first compilation after a restart may take longer. This setting does not change production builds. To reclaim an older disk cache, stop the dev server and remove `apps/next-app/.next/dev/cache/turbopack` before restarting.

See [Turbo environment modes](https://turborepo.dev/docs/reference/run#--env-mode-option). Loose mode is used only for this uncached development command; production builds bypass Turbo.

| Service               | Address                        | Purpose                                                |
| --------------------- | ------------------------------ | ------------------------------------------------------ |
| Web app               | <http://localhost:3000>        | Management UI, authentication, tRPC, MCP               |
| Public content server | <http://localhost:3001>        | Recipient pages, redirects and tracking                |
| Content health        | <http://localhost:3001/health> | Process liveness; not a database/Redis readiness check |
| SMTP capture UI       | <http://localhost:1080>        | View locally captured email                            |
| SMTP receiver         | `localhost:1025`               | Local mail delivery, no TLS/auth                       |
| PostgreSQL            | `localhost:5432`               | Application data                                       |
| Redis                 | `localhost:6379`               | Queues and events                                      |

Open <http://localhost:3000/setup>, create the first administrator, follow email verification using the SMTP capture UI, and create an organization. The setup route redirects to login after a user exists.

### 4. Run Storybook separately

```bash
pnpm storybook
```

Open <http://localhost:6006>. Storybook previews do not require application accounts or a running database. `pnpm storybook:build` produces static output under `packages/ui/dist/storybook`.

## Daily workflow and restarts

Run `pnpm dev:up` from the root. Hot reload handles source edits; restart the processes after changing environment values. After pulling dependency or schema changes, run:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:migrate:deploy
```

Ctrl+C stops the foreground application processes; infrastructure containers remain running. To stop infrastructure while preserving data:

```bash
docker compose stop postgres redis fakesmtp
```

To remove containers while preserving named database/Redis volumes, use `docker compose down`. Adding `--volumes` deletes those volumes and their data.

For individual processes, start infrastructure separately, export your trusted shell-compatible `.env` in each terminal, then run one application command per terminal:

```bash
set -a
. ./.env
set +a
```

```bash
pnpm --filter @next-phish/next-app dev
pnpm --filter @next-phish/static-server dev
pnpm --filter @next-phish/worker dev
```

These filtered commands bypass Turbo. Do not run them alongside `dev:up` for the same checkout. The old commands `pnpm dev:worker`, `pnpm dev:static-server` and `pnpm build:server` do not exist.

## Local campaign smoke test

1. Create an SMTP **sending profile** in the UI: host `localhost`, port `1025`, secure disabled, no credentials. Use a test sender address.
2. Send a test email from that profile and confirm it appears at port 1080.
3. Create an active email template, an active landing page, and an active target group with fictional addresses such as `alex@example.test`.
4. Create a **concrete campaign** using those assets and profile. A template campaign does not send directly and has no recipient statistics.
5. Publish and schedule the concrete campaign. Keep the worker running and `DELIVERY_ENABLED=true`.
6. Open the captured message, follow its link and check the recipient history/statistics. `PUBLIC_CONTENT_URL` must be reachable from the browser opening the message.

The global `SMTP_*` environment variables configure system/authentication messages. Campaign delivery uses the selected database-backed sending profile. Changing `SMTP_HOST` does not update existing profiles.

## Host processes versus Docker processes

The root Compose file also defines development containers for `next-app`, `static-server` and `worker`. Plain `docker compose up -d` starts those too; it is **not** equivalent to starting only infrastructure. Prefer the host workflow above for development; production uses a separate Compose file described in the [deployment guide](deployment.md).

| Connection   | Host process     | Process inside Compose |
| ------------ | ---------------- | ---------------------- |
| PostgreSQL   | `localhost:5432` | `postgres:5432`        |
| Redis        | `localhost:6379` | `redis:6379`           |
| SMTP capture | `localhost:1025` | `fakesmtp:1025`        |

Inside a container, `localhost` refers to that container. Keep public URLs browser-reachable; do not use `http://static-server:3001` in recipient links. Compose's `.env` interpolation does not automatically inject every variable into containers; only configured `environment`/`env_file` values are passed.

## Checks and useful commands

```bash
pnpm lint
pnpm typecheck
pnpm --filter @next-phish/ui test
pnpm --filter @next-phish/backend test
pnpm --filter @next-phish/next-app test:auth
pnpm --filter @next-phish/backend emails:check
pnpm db:studio
```

`pnpm build` runs all workspace build scripts, including Storybook. To build only the management app, use `pnpm --filter @next-phish/next-app build` with the required environment available. See the deployment guide before relying on worker/static-server `build` and `start` scripts.

## Troubleshooting

- **Port already in use:** inspect `docker compose ps` and, on macOS/Linux, `lsof -nP -iTCP:3000 -sTCP:LISTEN`. Stop the known owner; do not start a second stack.
- **Missing encryption key / PUBLIC_CONTENT_URL / R2 configuration:** use `pnpm dev:up`, which loads `.env`. When starting individual processes, export the environment first.
- **Prisma cannot connect:** verify infrastructure health and `DATABASE_URL`. `DB_*` does not construct the URL outside Compose. Existing PostgreSQL volumes retain their original credentials even after Compose environment edits.
- **Login redirects or links use the wrong port:** use the same origin, including port 3000, for `APP_URL`, `BETTER_AUTH_URL` and trusted origins; restart after editing.
- **SMTP capture is unavailable:** inspect `docker compose logs --tail=100 fakesmtp`. On architectures where the configured image cannot start, use a compatible SMTP capture image with host SMTP port 1025 and UI port 1080; keep the Compose service name `fakesmtp`.
- **Campaign remains pending:** check worker logs, schedule time/timezone, `DELIVERY_ENABLED`, Redis connectivity and the selected sending profile's host.
- **Uploads/imports fail:** verify R2 credentials/bucket permissions, and worker availability for asynchronous imports.
- **pnpm cannot verify/download its version:** check network access and the pinned package manager installation. Do not disable signature verification as a routine fix.

### Docker build cache disk usage

```bash
docker system df
docker buildx du
docker buildx prune --all
```

Pruning prompts for confirmation and removes unused build cache, not database volumes. The next image build may take longer. For a one-time size target instead, use `docker buildx prune --max-used-space 5gb` on versions supporting that flag. This does not configure a permanent cache limit. Avoid `docker system prune --volumes` when you want to preserve local database data.
