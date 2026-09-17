#!/usr/bin/env bash
# Uses previously built nextphish-production-* images, never the developer database.
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEST_DIR="$(mktemp -d)"
PROJECT="nextphish-smoke-$$"
WEB_PORT="${SMOKE_WEB_PORT:-43124}"
CONTENT_PORT="${SMOKE_CONTENT_PORT:-43125}"
cat > "$TEST_DIR/test.env" <<'ENV'
DB_USER=smoke
DB_PASSWORD=smoke
DB_NAME=smoke
DATABASE_URL=postgresql://smoke:smoke@postgres:5432/smoke
NODE_ENV=production
BETTER_AUTH_SECRET=smoke-test-only-secret-at-least-32-characters
BETTER_AUTH_URL=http://localhost:43124
APP_URL=http://localhost:43124
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:43124
PAGE_SUBMISSION_ENCRYPTION_KEY=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
DELIVERY_WEBHOOK_SECRET=smoke-test-webhook-secret
PUBLIC_CONTENT_URL=https://content.example.com
MESSAGE_ID_DOMAIN=mail.example.com
R2_ACCOUNT_ID=smoke
R2_ACCESS_KEY_ID=smoke
R2_SECRET_ACCESS_KEY=smoke
R2_BUCKET_NAME=smoke
SMTP_HOST=127.0.0.1
SMTP_PORT=1
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=smoke@example.test
DELIVERY_ENABLED=false
ENV
cat > "$TEST_DIR/override.yml" <<YAML
services:
  migrate:
    image: nextphish-production-migrate:latest
    env_file: !override ["$TEST_DIR/test.env"]
  next-app:
    image: nextphish-production-next-app:latest
    env_file: !override ["$TEST_DIR/test.env"]
    ports: !override ["127.0.0.1:$WEB_PORT:3000"]
  static-server:
    image: nextphish-production-static-server:latest
    env_file: !override ["$TEST_DIR/test.env"]
    ports: !override ["127.0.0.1:$CONTENT_PORT:3001"]
  worker:
    image: nextphish-production-worker:latest
    env_file: !override ["$TEST_DIR/test.env"]
YAML
compose() {
  docker compose --env-file "$TEST_DIR/test.env" -p "$PROJECT" \
    -f "$ROOT_DIR/docker-compose.production.yml" -f "$TEST_DIR/override.yml" "$@"
}
cleanup() {
  result=$?
  if [ "$result" -ne 0 ]; then compose logs --tail=60 next-app static-server worker; fi
  compose down --volumes --remove-orphans
  rm -rf "$TEST_DIR"
  exit "$result"
}
trap cleanup EXIT
compose up -d --wait postgres redis
compose run --rm --pull never migrate
compose up -d --no-build next-app static-server worker
for attempt in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:$CONTENT_PORT/health" >/dev/null && \
     curl -fsS "http://127.0.0.1:$WEB_PORT/login" >/dev/null && \
     compose logs worker 2>&1 | grep -q 'Execution workers started'; then
    echo "Production smoke test passed: migrations, web login, content health and worker startup."
    exit 0
  fi
  sleep 2
done
echo "Production smoke test timed out" >&2
exit 1
