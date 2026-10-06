# Cloudflare Pages Deployment

## Production mode

Canonical production hosting is **Cloudflare Pages**.

## Required commands

- Build: `npm run build`
- Verify: `npm run verify:build`

## Static output directory

- Next App Router static export output: `out/`
- Cloudflare Pages deploy target: `out/`

## Pages project settings

- Framework preset: `None` (static)
- Build command: `npm run build`
- Build output directory: `out`
- Node version: `22`

## Redirect and header infrastructure

- `public/_redirects` and `public/_headers` are Cloudflare static infrastructure files.
- They must be present in deploy output (`out/_redirects`, `out/_headers`) after build/export.

## Data ownership policy

- Workbook (`data-sources/herb_monograph_master.xlsx`) is the only source of truth.
- `public/data/**` and `public/blogdata/**` are generated artifacts and must not be manually edited.

## Pages Function environment (newsletter / `functions/api/subscribe.ts`)

The newsletter subscribe endpoint runs as a Cloudflare Pages Function. It is hardened to
**fail closed in production**: if rate limiting or bot protection cannot be enforced, the
request is rejected rather than processed.

Set these in **Cloudflare Pages → Settings → Environment variables (Production)**:

| Variable | Required in prod | Purpose / behavior if missing |
|----------|------------------|-------------------------------|
| `ENVIRONMENT` | Yes | Must be `production` (also accepts `prod`/`true`). Enables fail-closed behavior. |
| `TURNSTILE_SECRET_KEY` | Yes | Cloudflare Turnstile secret. If missing in production the endpoint returns `503`. |
| `RATE_LIMIT_IP_HASH_SALT` | Yes | Long random secret used to **hash client IPs** before they are written to KV (raw IPs are never stored). |
| `MAILCHIMP_API_KEY` | Yes | Mailchimp API key. |
| `MAILCHIMP_API_SERVER` | Yes | Mailchimp server prefix (e.g. `us19`). |
| `MAILCHIMP_LIST_ID` | Yes | Mailchimp audience/list id. |
| `MAILCHIMP_ADHD_TAG` | Optional | Tag applied to new subscribers. |

KV binding (**Settings → Functions → KV namespace bindings**):

| Binding | Required in prod | Purpose / behavior if missing |
|---------|------------------|-------------------------------|
| `RATE_LIMIT_KV` | Yes | Rate-limit counter store (max 5 requests / 10 min per hashed IP). If unbound in production the endpoint returns `429` (fail closed). In local dev it stays permissive. |

Production fail-closed responses:

- Missing `TURNSTILE_SECRET_KEY` → `503 Security verification is not configured.`
- Missing `RATE_LIMIT_KV` binding, or a KV read/write failure → `429 Too many requests.`

Local development (no `ENVIRONMENT=production`) remains permissive when KV/Turnstile are
absent so the form can be exercised without the full production stack. Fail-closed behavior
is covered by `app/__tests__/subscribe.test.ts`.

## Pages Function environment (crawl experiment / `functions/herbs/_middleware.ts`)

Verified Googlebot HTML telemetry for the Request Indexing experiment is scoped to `/herbs/*`.
The middleware verifies Googlebot-looking requests against Google's published common-crawler
CIDR feed and never stores the source IP.

Optional KV binding (**Settings → Functions → KV namespace bindings**):

| Binding | Required in prod | Purpose / behavior if missing |
|---------|------------------|-------------------------------|
| `CRAWL_EXPERIMENT_KV` | No | Durable 90-day storage for verified crawl events. If unbound, events still go to Cloudflare Function logs; page delivery and bot verification remain unaffected. |

The crawl telemetry path is deliberately **fail open**: CIDR-fetch or telemetry-write failures
must never change crawler-visible status, content, canonical behavior, or response availability.
See `experiments/crawl-request-indexing/README.md` for the manifest, randomization, freeze, and
analysis contract.



## Pages Function environment (THS Publisher / `functions/api/publisher/*`)

THS Publisher is the first-party publication queue/control boundary. Provider IDs are receipts underneath a THS `publication_id`; they are not canonical identity.

Set this server-only production secret:

| Variable | Required | Purpose |
|---|---|---|
| `THS_PUBLISHER_ADMIN_TOKEN` | Yes | Bearer secret protecting enqueue/read/update/dispatch/observe/manual Publisher endpoints. |

Create a Cloudflare D1 database for Publisher state, apply `migrations/0001_ths_publisher.sql`, and bind it to Pages Functions as:

| Binding | Required | Purpose |
|---|---|---|
| `THS_PUBLISHER_DB` | Yes | Durable canonical publication jobs, immutable publication identity indexes, attempts, provider receipts, and Observer evidence. Missing binding fails closed. |

The migration enforces a single writer per platform + intended-time slot. Due-work lookup returns only `QUEUED` jobs; `FAILED` and `NEEDS_RECONCILIATION` are never blindly auto-retried.

See `docs/ths-publisher-v0.1.md` for the architecture, state machine, and transition policy.

## Pages Function environment (TikTok draft upload / `functions/api/tiktok/*`)

The first-party TikTok bridge is server-only. It uses TikTok Content Posting API `video.upload` to send a governed MP4 into the authorized creator's TikTok inbox/draft flow. It does not provide unattended Direct Post.

Set these in **Cloudflare Pages → Settings → Environment variables (Production)**:

| Variable | Required | Purpose |
|---|---|---|
| `TIKTOK_CLIENT_KEY` | Yes | TikTok developer-app client key. |
| `TIKTOK_CLIENT_SECRET` | Yes | TikTok developer-app secret; server-only. |
| `TIKTOK_REDIRECT_URI` | Yes | Exact registered OAuth callback; production value is `https://thehippiescientist.net/api/tiktok/callback`. |
| `TIKTOK_PUBLISHER_ADMIN_TOKEN` | Yes | Long random bearer secret protecting connect/connection/upload/status endpoints. |

Dedicated KV binding:

| Binding | Required | Purpose |
|---|---|---|
| `TIKTOK_TOKEN_KV` | Yes | Stores short-lived OAuth state and the refreshable TikTok user token bundle, including rotated refresh tokens. Missing binding fails closed. |

TikTok-side setup must approve `video.upload`, authorize the target creator account, register the callback URI, and verify ownership of `https://thehippiescientist.net/media/distribution/` for `PULL_FROM_URL`.

See `docs/tiktok-draft-upload-provider.md` for setup, connection, upload, status, and failure semantics.
