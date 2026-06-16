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
