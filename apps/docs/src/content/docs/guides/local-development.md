---
title: Local development
description: Install, configure and run the NextPhish workspace on your machine.
---

Run commands from the repository root. You need Node.js **24**, pnpm **10.33.4**, Docker with Compose v2, and Bash. Ports 3000, 3001, 5432, 6379, 1025 and 1080 should be available.

## First run

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm setup
```

Copy `.env.example` only when `.env` does not already exist. `pnpm setup` links the root environment file into the application and database workspaces. Set `APP_URL`, `BETTER_AUTH_URL` and `BETTER_AUTH_TRUSTED_ORIGINS` to `http://localhost:3000`; set `PUBLIC_CONTENT_URL` to `http://localhost:3001`. Replace the example `BETTER_AUTH_SECRET`, `PAGE_SUBMISSION_ENCRYPTION_KEY` and `DELIVERY_WEBHOOK_SECRET` with independent random values. Use `openssl rand -base64 32` for the auth secret and `openssl rand -hex 32` for each hex key.

The example PostgreSQL URL is `postgresql://postgres:postgres@localhost:5432/next_phish`. `DATABASE_URL` is read directly by Prisma; changing the individual `DB_*` values does not update it. Keep existing database credentials and encryption keys when upgrading a checkout.

The four `R2_*` settings must be nonempty at service startup. Uploads, attachments, imports and previews require a working Cloudflare R2 bucket; placeholder values only support screens that do not access storage.

```bash
docker compose up -d postgres redis fakesmtp
pnpm db:generate
pnpm db:migrate:deploy
pnpm dev:up
```

`pnpm dev:up` starts the infrastructure containers and runs the management app, content server and worker on the host. It does not install dependencies or apply migrations. Restart it after editing `.env`.

| Service               | URL or port             |
| --------------------- | ----------------------- |
| Management app        | `http://localhost:3000` |
| Public content server | `http://localhost:3001` |
| SMTP capture UI       | `http://localhost:1080` |
| SMTP receiver         | `localhost:1025`        |

Open `http://localhost:3000/setup`, create the first administrator, verify the email through the SMTP capture UI, then create an organization. The setup page is only available before the first account exists.

## Test a campaign locally

Create an SMTP [sending profile](/app/sending-profiles/) with host `localhost`, port `1025`, secure mode off and no credentials. Send a test message and check the capture UI. Then create active assets, a target group with fictional addresses such as `alex@example.test`, and a concrete campaign. Publish and schedule it with the worker running and `DELIVERY_ENABLED=true`.

`SMTP_*` in `.env` configures system mail. Campaign mail uses the selected sending profile stored in the application.

## Daily commands

```bash
pnpm dev:up
pnpm storybook
pnpm lint
pnpm typecheck
```

Storybook runs separately at `http://localhost:6006`. After pulling schema or dependency changes, rerun `pnpm install --frozen-lockfile`, `pnpm db:generate` and `pnpm db:migrate:deploy`. For troubleshooting and the host/container networking table, see the [repository setup guide](https://github.com/NextPhish/next-phish/blob/main/docs/setup.md).
