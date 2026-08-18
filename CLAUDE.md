# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Next.js 16 (App Router, TypeScript) dashboard that ingests security-scan reports from the TBI `backend` repo's GitLab CI pipeline (`backend/.gitlab-ci.yml`, `send_reports` job) and renders them for review. Covers four report kinds: SAST + secret detection (consolidated), Trivy dependency (filesystem) scanning, and Trivy container (image) scanning. Storage is a flat JSON file via `lowdb` (`db.json`), no external database.

## Commands

```bash
pnpm install
pnpm dev      # next dev
pnpm build    # next build
pnpm start    # next start (production)
pnpm lint     # eslint
```

`docker compose up` builds from `Dockerfile.dev` and runs `pnpm i && pnpm run dev` with the repo bind-mounted (`docker-compose.yml`). The production image (`Dockerfile`) is a multi-stage pnpm build; it bakes `db.json` under `/app/db` in the final image, owned by a non-root `nextjs` user — the container is stateful, so redeploying without a persistent volume for `/app/db` drops stored reports.

## Environment variables

Typed in `app/types/env.d.ts`; set via `.env.development` locally.

- `NEXT_PUBLIC_BASE_URL` — used to build the `viewUrl` links returned by the webhook routes and sent to Discord.
- `GITLAB_WEBHOOK_SECRET` — shared secret checked against the incoming `X-Gitlab-Token` header on every webhook route. Must match the value GitLab CI sends (`$GITLAB_WEBHOOK_SECRET` in `backend/.gitlab-ci.yml`'s `send_reports` job).
- `DISCORD_WEBHOOK_URL` — optional; when set, `/api/sast-webhook` posts a summary embed to Discord after storing a report.

## Webhook routes — payload contracts

Three routes under `app/api/*/route.ts`, all POST-only, all gated by the same `X-Gitlab-Token` check, all backed by `lowdb` collections in `app/lib/db.ts` (`reports`, `trivyReports`, `containerScanReports`):

- **`POST /api/sast-webhook`** — expects `{ repoName: string, sastReport: { vulnerabilities: Vulnerability[] } }`. Stores into `db.data.reports`, keyed by a fresh UUID; viewable at `/reports/[id]`. This is where GitLab CI's raw `gl-sast-report.json` and `gl-secret-detection-report.json` get merged into one `vulnerabilities` array by the CI job before sending — the route itself only expects the already-consolidated shape.
- **`POST /api/dependency-webhook`** — expects `{ repoName: string, trivyReport: TrivyReport }` (raw `trivy fs --format json` output). Stores into `db.data.trivyReports`; viewable at `/dependency-scan/[id]` (no list/index page yet — reports are only reachable by direct link).
- **`POST /api/container-scan-webhook`** — expects `{ repoName: string, containerScanReport: ContainerScanReport }` (raw `trivy image --format json` output). Stores into `db.data.containerScanReports`; viewable at `/container-scan/[id]`, with `/container-scan` as the list page.

**Keep these route paths and payload field names in sync with `backend/.gitlab-ci.yml`'s `send_reports` job** — that job's `jq` calls build the exact payload shape each route destructures, and there's no schema validation layer between them; a mismatched field name fails with a 400 (or a routing mismatch on a renamed path fails with a 404), not a type error.

The home page (`/`, `app/page.tsx`) also accepts a manually-uploaded SAST JSON file client-side, independent of the webhook/storage path — it's a scratch viewer, not persisted to `db.json`.

## Deploys and the `send_reports` job

The GitLab CI `send_reports` job hits `$SAST_DASHBOARD_URL` (currently `https://sast-dashboard.dumbledore.dev` in `backend/.gitlab-ci.yml`) directly — this repo isn't deployed by that pipeline. If a webhook route is renamed or its payload shape changes here, the change is inert in CI until this app is committed *and deployed*; check `git log`/deploy state here before assuming a route rename has taken effect in production.
