# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Next.js 16 (App Router, TypeScript) dashboard that ingests security-scan reports from the TBI `backend` repo's GitLab CI pipeline (`backend/.gitlab-ci.yml`, `send_reports` job) and renders them for review. Covers four report kinds: SAST, secret detection, Trivy dependency (filesystem) scanning and Trivy container (image) scanning. Storage is plain files (`app/lib/store.ts`), no database: one JSON file per report under `$DATA_DIR/<kind>/<id>.json` plus an append-only `$DATA_DIR/<kind>/index.jsonl` (id, repo, timestamp, severity counts) that list pages read. `DATA_DIR` defaults to `./data`; the production image sets `/app/data`, where the compose volume is mounted.

It used to be a single lowdb `db.json` read and rewritten whole on every request; at ~80 MB that ran Node out of heap on each dependency-scan webhook (502s and a crash loop, Nov 2026). Never go back to loading every report into memory. `scripts/migrate-db-json.mjs <db.json> <data dir>` moves an old `db.json` into the store (ids kept, re-runnable).

## Commands

```bash
pnpm install
pnpm dev      # next dev
pnpm build    # next build
pnpm start    # next start (production)
pnpm lint     # eslint
```

`docker compose up` builds from `Dockerfile.dev` and runs `pnpm i && pnpm run dev` with the repo bind-mounted (`docker-compose.yml`). The production image (`Dockerfile`) is a multi-stage pnpm build running as a non-root `nextjs` user (uid 1001); reports live in `/app/data`, which must be a persistent volume writable by uid 1001 (redeploying without it drops stored reports).

## Environment variables

Typed in `app/types/env.d.ts`; set via `.env.development` locally.

- `NEXT_PUBLIC_BASE_URL` — used to build the `viewUrl` links returned by the webhook routes and sent to Discord.
- `GITLAB_WEBHOOK_SECRET` — shared secret checked against the incoming `X-Gitlab-Token` header on every webhook route. Must match the value GitLab CI sends (`$GITLAB_WEBHOOK_SECRET` in `backend/.gitlab-ci.yml`'s `send_reports` job).
- `DISCORD_WEBHOOK_URL` — optional; when set, `/api/sast-webhook` posts a summary embed to Discord after storing a report.

## Webhook routes — payload contracts

Four routes under `app/api/*/route.ts`, all POST-only, all built by `reportWebhook()` (`app/lib/webhook.ts`: `X-Gitlab-Token` check, payload field, `saveReport`, Discord embed), answering 201 with `{ reportId, viewUrl }`:

- **`POST /api/sast-webhook`** — `{ repoName, sastReport: { vulnerabilities } }` (GitLab's `gl-sast-report.json`). Kind `sast`, viewed at `/reports/[id]`.
- **`POST /api/secret-detection-webhook`** — `{ repoName, secretDetectionReport: { vulnerabilities } }` (`gl-secret-detection-report.json`, same shape as SAST). Kind `secret`, viewed at `/secret-detection/[id]`.
- **`POST /api/dependency-webhook`** — `{ repoName, trivyReport }` (raw `trivy fs --format json`). Kind `dependency`, viewed at `/dependency-scan/[id]` (no list page yet).
- **`POST /api/container-scan-webhook`** — `{ repoName, containerScanReport }` (raw `trivy image --format json`). Kind `container`, viewed at `/container-scan/[id]`, listed at `/container-scan`.

**Keep these route paths and payload field names in sync with the TBI `backend`/`frontend` `.gitlab-ci.yml` `send_reports` jobs** — their `jq` calls build the exact payload each route reads; a mismatched field fails with a 400, a renamed path with a 404. The reverse proxy (`reverse-proxy-ovh`, `nginx/configs/sast.conf`) must allow bodies of several MB (`client_max_body_size`): a Trivy report is ~1 MB and nginx's default limit is 1 MB (413).

The home page (`/`, `app/page.tsx`) also accepts a manually-uploaded SAST JSON file client-side, independent of the webhook/storage path — it's a scratch viewer, not persisted.

## UI

shadcn/ui (new-york, zinc) on Tailwind v4: primitives in `app/components/ui/` (add more with `pnpm dlx shadcn@latest add <name>`; aliases in `components.json`), tokens and the severity palette (`--sev-*`) in `app/globals.css`, dark mode via next-themes' `.dark` class (`@custom-variant dark`). Severity names, order, icons and badge classes live only in `app/lib/severity.ts` (`normalizeSeverity` maps GitLab "Critical" and Trivy "CRITICAL" alike). Report pages render `SastReportExplorer` / `TrivyReportExplorer`: the severity cards toggle a multi-select filter kept in `?severity=critical,high` (`app/hooks/useSeverityFilter.ts`, written with `history.replaceState` so a click doesn't refetch the server-rendered report), plus a text search and Critical→Unknown ordering.

## Deploys and the `send_reports` job

The GitLab CI `send_reports` job hits `$SAST_DASHBOARD_URL` (currently `https://sast-dashboard.dumbledore.dev` in `backend/.gitlab-ci.yml`) directly — this repo isn't deployed by that pipeline. If a webhook route is renamed or its payload shape changes here, the change is inert in CI until this app is committed *and deployed*; check the deploy state before assuming a route rename has taken effect in production.

This app deploys itself from GitLab (`gitlab.dumbledore.dev`, `dumbledore.dev/sast-dashboard`; the GitHub remote is a mirror). `.gitlab-ci.yml`: on the default branch, lint + `tsc`, build and push `viniroveran/sast-dashboard:<short sha>` and `:latest` to Docker Hub, then SSH to sv2 (`15.204.246.135`, the `ssh sv2` host). sv2 runs the container from `~/reverse-proxy/compose/apps.yml` (service `sast-dashboard`, volume `sast_db_data` → `/app/data`, behind the shared `nginx` container, vhost `nginx/configs/sast.conf`). The CI key is pinned in sv2's `authorized_keys` to `restrict,command="/home/ubuntu/bin/deploy-sast-dashboard"`: it can only run that script (pull + recreate the service, health check, `nginx -t` + SIGHUP, since nginx resolves the upstream only on reload), so changing what a deploy does means editing that script on sv2, not the pipeline. `./publish` still builds and pushes by hand but does not deploy; `ssh sv2 ~/bin/deploy-sast-dashboard` does.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
