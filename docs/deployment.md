# Deployment and operations

This guide deploys three long-running services: the management web app, the public content server and the campaign worker. Use the dedicated `docker-compose.production.yml`; the default `docker-compose.yml` is for development.

## Service topology

| Service         | Purpose                                                                            | Exposure                                                |
| --------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `next-app`      | Next.js UI, authentication, tRPC, MCP and delivery callbacks                       | HTTPS management hostname; container port 3000          |
| `static-server` | Recipient-facing content, redirects, submissions and tracking                      | Separate HTTPS hostname; container port 3001            |
| `worker`        | Scheduling, materialization, delivery, imports, notifications and event processing | No inbound public port                                  |
| PostgreSQL 16   | Application data                                                                   | Private network only                                    |
| Redis 7         | BullMQ queues                                                                      | Private network only, persistence enabled, `noeviction` |
| Cloudflare R2   | Attachments, imports and preview objects                                           | Bucket credentials supplied to application services     |
| Mail provider   | System messages and campaign delivery                                              | Outbound SMTP/API access                                |

The Compose stack publishes the web/content ports only on host loopback. Put an HTTPS reverse proxy on the host in front of them. PostgreSQL and Redis have no published ports. The stack does not provision DNS, certificates, a mail provider or an R2 bucket.

Use separate origins such as `https://console.example.com` and `https://content.example.com`. Replace these examples with domains you control. Do not serve recipient HTML on the authenticated management origin.

The public content hostname and `MESSAGE_ID_DOMAIN` are validated by the application. They must be valid neutral domain names; the current validation rejects names containing `phish`, `simulation`, `next-phish` or `security-test`. Production does not accept `localhost` as the public content hostname.

## Production artifacts

`Dockerfile.production` defines shared build stages and four targets:

- `next-app`: Next.js standalone output, static assets and public files, started directly by Node.
- `worker`: bundled JavaScript plus production dependencies, started with `node dist/index.js`.
- `static-server`: bundled JavaScript plus production dependencies, started with `node dist/index.js`.
- `migrate`: a maintenance image containing Prisma CLI and migration files.

The worker/content build scripts bundle workspace TypeScript and dependencies with esbuild. Prisma remains external because it loads a generated native client; BullMQ remains external because it loads package assets. Prisma clients are generated on the target platform. Runtime images use the unprivileged `node` user. No source bind mounts or hot-reload commands are used.

Build-time environment values in the Dockerfile are inert placeholders. Real runtime secrets come from `.env`, not Docker build arguments. `.dockerignore` excludes environment files, local dependencies and generated build output. Do not remove those exclusions or put secrets in `NEXT_PUBLIC_*` values.

## 1. Prepare configuration

Install Docker with Compose v2 and BuildKit. Check out a specific reviewed commit or release on the deployment host. From the repository root:

```bash
cp .env.example .env
chmod 600 .env
```

Do not overwrite an existing production `.env` during upgrades. Set the following before startup:

| Variable                                                                       | Production configuration                                                                                                        |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME`                                            | Dedicated database credentials; Compose constructs the internal `DATABASE_URL` from these                                       |
| `DATABASE_URL`                                                                 | Required for host-based commands; use a reachable PostgreSQL URL there. The production Compose file overrides it for containers |
| `BETTER_AUTH_SECRET`                                                           | Independently generated secret, at least 32 characters                                                                          |
| `BETTER_AUTH_URL`, `APP_URL`                                                   | Public HTTPS management origin                                                                                                  |
| `BETTER_AUTH_TRUSTED_ORIGINS`                                                  | Comma-separated allowed management origins; never use a wildcard                                                                |
| `PAGE_SUBMISSION_ENCRYPTION_KEY`                                               | Persistent 64-character hex key; same value on all application services                                                         |
| `DELIVERY_WEBHOOK_SECRET`                                                      | Independent secret for authenticated delivery callbacks                                                                         |
| `PUBLIC_CONTENT_URL`                                                           | Public HTTPS content origin                                                                                                     |
| `MESSAGE_ID_DOMAIN`                                                            | Valid neutral domain under your control                                                                                         |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Real provider settings for system/authentication mail; `SMTP_SECURE=true` for implicit TLS, commonly port 465                   |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`  | Production R2 bucket credentials with the required object read/write/delete permissions                                         |
| `TRUSTED_PROXY_NETWORKS`                                                       | Only the proxy IPs/CIDRs that may supply forwarded client IPs                                                                   |
| `DELIVERY_ENABLED`                                                             | Start with `false` while configuring and checking a fresh deployment; change to `true` when ready for campaign delivery         |

Generate separate values for each secret:

```bash
openssl rand -base64 32
openssl rand -hex 32
openssl rand -hex 32
```

Use a URL-safe database password (e.g. hex output) with the provided Compose template because it interpolates credentials into a URL. For passwords with reserved URL characters, adapt `DATABASE_URL` explicitly with percent-encoded credentials rather than percent-encoding the actual PostgreSQL password.

The current Redis connections use `REDIS_HOST` and `REDIS_PORT`, without password/TLS options. The included private Redis service matches that implementation. A managed Redis requiring authentication or TLS needs connection configuration changes before use; setting an undocumented `REDIS_URL` will not configure it.

Campaign mail uses sending profiles stored in the database. Global `SMTP_*` settings alone do not configure campaign delivery. In production, a sending profile must point to a real provider reachable from the worker container, not `localhost` or the development `fakesmtp` service.

Back up the encryption/auth secrets separately from application data. Losing or casually replacing the submission encryption key can make existing encrypted data unreadable.

## 2. Build and migrate

Always specify the production file; do not merge it with the development file:

```bash
docker compose -f docker-compose.production.yml build next-app static-server worker migrate
docker compose -f docker-compose.production.yml up -d postgres redis
docker compose -f docker-compose.production.yml run --rm migrate
```

The migration command runs `prisma migrate deploy`, not `migrate dev` or `db push`. It is a one-shot maintenance service; do not start the application services until it exits successfully.

The default project name is `nextphish-production`. This creates separate production volumes and does not reuse volumes from a development Compose project. Use an explicit, consistent `-p` project name on **every** command if you change it. Changing project names can make an existing installation appear empty because it selects different volumes.

## 3. Start services and configure HTTPS

```bash
docker compose -f docker-compose.production.yml up -d next-app static-server worker
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs --tail=100 next-app static-server worker
```

A minimal Caddy configuration for a proxy installed on the same host is:

```caddyfile
console.example.com {
    reverse_proxy 127.0.0.1:3000
}

content.example.com {
    reverse_proxy 127.0.0.1:3001
}
```

Point both DNS records to the server and allow the proxy's HTTP/HTTPS certificate issuance and serving traffic. If your proxy is containerized, connect it to the application network and proxy to service names; `127.0.0.1` inside that proxy is not the host. Configure forwarded headers and trusted proxy ranges for your actual topology. Preserve request paths/query strings and do not cache authenticated management responses or tracking endpoints.

The content `/health` route checks process liveness only. The web app does not currently expose a dedicated readiness endpoint. Use an HTTP check of `/login`, inspect worker logs, and exercise database-backed UI to verify readiness.

## 4. Bootstrap and smoke-test

Before allowing general access, visit `https://console.example.com/setup`, create the initial administrator, complete the email verification flow and create an organization. This initial route is only available while no user exists.

Verify:

1. Management `/login` loads through HTTPS without redirect loops.
2. Content `/health` returns `{"status":"ok"}` through its public origin.
3. Verification/reset mail uses the management hostname and reaches your test inbox.
4. A small attachment upload and preview works with R2.
5. Worker logs contain `Execution workers started`, without repeated Redis/database errors.
6. Create a sending profile and use its test-email action with an authorized test recipient.
7. Set `DELIVERY_ENABLED=true`, recreate the worker, then schedule a small concrete campaign with test recipients and confirm delivery/history/tracking end to end.

```bash
# After editing .env; restart alone does not reload a container's environment.
docker compose -f docker-compose.production.yml up -d --force-recreate worker
```

Use `--force-recreate next-app static-server worker` when changing settings shared by all three services. `DELIVERY_ENABLED=false` gates campaign delivery; it is not a global mute for authentication mail, test-email actions or every background job.

A published template campaign is reusable source material for concrete campaigns; it does not itself have delivery statistics or recipients.

## Delivery provider callbacks

The management route `POST /api/webhooks/delivery` accepts the application's normalized delivery-event protocol, authenticated with `x-event-timestamp` and `x-event-signature`. It is not a generic endpoint to which every provider's native webhook format can be sent unchanged. Consult the route and `verifyWebhookSignature` implementation when integrating a provider adapter. An unset secret returns 503; an invalid signature returns 401. Keep the callback secret out of URLs and logs.

## Updates and rollback

1. Record the running commit/image identifiers and back up the database, R2 objects and secrets.
2. Review schema migrations and configuration changes before upgrading.
3. Build new images without replacing the running services.
4. Schedule a maintenance window if migrations are not backward compatible. Stop application services before applying such migrations, including the worker.
5. Run the migration service once. If it fails, investigate before starting the new release.
6. Start/recreate the web app, content server and worker; repeat the smoke checks.

```bash
docker compose -f docker-compose.production.yml build next-app static-server worker migrate
docker compose -f docker-compose.production.yml stop next-app static-server worker
docker compose -f docker-compose.production.yml run --rm migrate
docker compose -f docker-compose.production.yml up -d next-app static-server worker
```

Tag/store release images in your registry or retain the previous images before building replacements. For immutable deployments, set each service's `image` to a release tag/digest and deploy those artifacts instead of rebuilding on the host.

Rolling back application code does not undo database migrations. Restore a tested database backup or apply a reviewed forward-fix when the old code cannot use the new schema. A database restore also changes delivery state: stop workers, reconcile external deliveries and queued jobs before resuming, and avoid blindly replaying messages already accepted by the provider.

## Backups and recovery

Create a logical PostgreSQL backup using the container's credentials (the single quotes keep expansion inside the container):

```bash
mkdir -p backups
chmod 700 backups
docker compose -f docker-compose.production.yml exec -T postgres sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > backups/nextphish.dump
```

Use timestamped filenames or move the file to protected off-host storage so later runs do not overwrite your only backup. Back up R2 objects and configuration/secrets as well. Redis has AOF persistence in the provided production stack; include its volume in a consistent recovery plan. Do not copy a live database volume as a substitute for a database-consistent backup.

Test restoration into an isolated database first. The following **replaces objects in the target database** and must only be run against an intentionally selected restore target with application processes stopped:

```bash
docker compose -f docker-compose.production.yml exec -T postgres sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' < backups/nextphish.dump
```

Never run `docker compose down --volumes` on an installation whose data you intend to retain.

## Logs, capacity and maintenance

- Inspect logs with `docker compose -f docker-compose.production.yml logs --tail=200 -f worker`; configure Docker log rotation on the deployment host.
- Monitor database capacity, Redis memory/persistence, worker failures, schedule delay, delivery attempts and R2 failures.
- Start with the worker concurrency/rate defaults in `.env.example`; tune against provider limits and database capacity. A second worker adds processing capacity but also changes total concurrency.
- Keep `stop_grace_period` long enough for in-flight work to finish. The worker handles SIGTERM and closes its queues.
- `docker system df` reports disk usage; `docker buildx prune` frees unused build cache. Keep rollback images and persistent volumes. Cache pruning is different from deleting images or database volumes.
- Development SMTP capture and Storybook are not part of the production Compose stack.

## Running without Docker

Install Node.js 24 and the pinned pnpm, provision PostgreSQL/Redis, and export the same environment settings. From a trusted shell-compatible root `.env`:

```bash
set -a
. ./.env
set +a
pnpm install --frozen-lockfile
pnpm build:production
pnpm db:migrate:deploy
NODE_ENV=production pnpm start
```

`build:production` generates Prisma, checks compiled system-email templates, bundles worker/content JavaScript, and builds Next.js. It does not build Storybook. `pnpm start` starts existing artifacts without implicitly building them. For a process manager, run these as separate services from the release directory, with the environment injected into each:

```bash
NODE_ENV=production pnpm --filter @next-phish/next-app start
NODE_ENV=production pnpm --filter @next-phish/static-server start
NODE_ENV=production pnpm --filter @next-phish/worker start
```

Keep the checkout and installed dependencies with host-based builds; do not move only `dist/index.js` to another machine without its runtime dependencies. Build on the target platform so Prisma's native client matches it. Use a process manager to restart failed services and a reverse proxy for HTTPS. The Docker web image runs standalone output directly; the host `start` script uses `next start` against the local build.

## Packaging notes

The old per-app Dockerfiles now expose development targets only. Their former production stages installed only production dependencies before attempting a build; they have been replaced by `Dockerfile.production`. The former worker/content `tsc` builds inherited `noEmit: true`, leaving `start` without an artifact; the new bundle scripts explicitly produce `dist/index.js`.

The migration image intentionally includes build tooling. Long-running service targets contain runtime artifacts. Compose uses mutable base image tags in source; pin them by digest in a controlled release pipeline if reproducibility is required.

## Automated smoke test

After building the default `nextphish-production-*` images, run:

```bash
bash scripts/smoke-production.sh
```

This requires Compose 2.24.4 or newer (`!override` support), Bash and curl. It starts a uniquely named temporary stack with dummy secrets, a fresh PostgreSQL database and separate Redis, applies migrations, checks `/login`, `/health` and worker startup, then removes only that test stack and its volumes. SMTP delivery is disabled and R2 credentials are dummy values. It does not exercise real mail delivery, storage uploads or public TLS. Ports 43124 and 43125 must be free; `SMOKE_WEB_PORT` and `SMOKE_CONTENT_PORT` can override them.
