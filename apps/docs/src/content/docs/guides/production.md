---
title: Production deployment
description: Deploy the web app, worker and public content server with the production Compose stack.
---

NextPhish runs a management app, a delivery worker and a public content server alongside PostgreSQL and Redis. Use separate HTTPS origins for management and recipient content, for example `console.example.com` and `content.example.com`. The supplied stack binds web and content ports to host loopback; configure DNS, certificates and an HTTPS reverse proxy separately.

## Configure

Install Docker with Compose v2 and BuildKit, then check out a reviewed release or commit. From the repository root:

```bash
cp .env.example .env
chmod 600 .env
```

Keep an existing production `.env` during upgrades. Configure database credentials; `BETTER_AUTH_SECRET`; `BETTER_AUTH_URL`, `APP_URL` and exact trusted origins; the persistent 64-character hex `PAGE_SUBMISSION_ENCRYPTION_KEY`; `DELIVERY_WEBHOOK_SECRET`; `PUBLIC_CONTENT_URL`; a neutral `MESSAGE_ID_DOMAIN`; system `SMTP_*`; working `R2_*`; and proxy ranges in `TRUSTED_PROXY_NETWORKS`. Set `DELIVERY_ENABLED=false` until the installation is checked.

The public content hostname and message ID domain must be valid neutral domains. The current validator rejects names containing `phish`, `simulation`, `next-phish` or `security-test`, and production does not allow `localhost` as the public content hostname. Protect and back up the auth and encryption secrets.

## Build, migrate and start

```bash
docker compose -f docker-compose.production.yml build next-app static-server worker migrate
docker compose -f docker-compose.production.yml up -d postgres redis
docker compose -f docker-compose.production.yml run --rm migrate
docker compose -f docker-compose.production.yml up -d next-app static-server worker
docker compose -f docker-compose.production.yml ps
```

Wait for the one-shot `migrate` service to succeed before starting the application services. It runs `prisma migrate deploy`. Always specify the production Compose file; the default Compose file is for development.

For a reverse proxy on the same host, forward the management hostname to `127.0.0.1:3000` and the content hostname to `127.0.0.1:3001`. If the proxy runs in a container, use service networking instead of container-local `127.0.0.1`. Keep recipient HTML away from the authenticated management origin.

## Verify delivery

1. Visit the management `/setup` route, create the first administrator, verify email and create an organization.
2. Check `/login` through HTTPS and `/health` on the public content origin. `/health` reports content-process liveness only.
3. Confirm system email and a small R2 upload or preview.
4. Check worker logs for `Execution workers started`.
5. Create a real [sending profile](/app/sending-profiles/) and send a test email to an authorized recipient. The production worker cannot use the local development `fakesmtp` service or `localhost` as its provider.
6. Set `DELIVERY_ENABLED=true`, recreate the worker to reload its environment, and run a small concrete campaign end to end.

```bash
docker compose -f docker-compose.production.yml up -d --force-recreate worker
```

The environment `SMTP_*` sends authentication/system mail; campaign delivery uses application sending profiles. `DELIVERY_ENABLED=false` gates campaign delivery, not every outgoing message or job.

For upgrades, backups, rollback and non-Docker deployment, follow the detailed [repository deployment guide](https://github.com/MartinAndreev/next-phish/blob/main/docs/deployment.md). Back up PostgreSQL, R2 objects, Redis state and secrets before upgrading; database migrations are not undone by rolling back application images.
