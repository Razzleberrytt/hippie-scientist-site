# First-party TikTok draft upload

## Purpose

This provider removes Metricool as the only TikTok transport without pretending that an API dispatch is a public post.

The supported path is:

`governed THS vertical video -> deployed hash-verified MP4 -> Cloudflare TikTok bridge -> TikTok inbox draft -> human review/post in TikTok`

The bridge uses TikTok Content Posting API `video.upload` with `PULL_FROM_URL`. It does **not** implement Direct Post. TikTok's current Direct Post developer guidelines reject private/internal utilities whose purpose is uploading content to accounts the developer or team manages, and they require per-post creator control/consent. That makes a hidden unattended public-post bot the wrong integration for this site.

## Repository pieces

- `functions/_shared/tiktok-content-posting.ts` — OAuth/token lifecycle, URL gate, draft initialization, status polling.
- `functions/api/tiktok/connect.ts` — authenticated setup endpoint that creates the one-time TikTok authorization URL.
- `functions/api/tiktok/callback.ts` — OAuth callback; validates one-time state and stores the refreshable token bundle.
- `functions/api/tiktok/connection.ts` — authenticated connection summary with no token disclosure.
- `functions/api/tiktok/status.ts` — authenticated status polling.
- `scripts/distribution/upload-tiktok-draft.mjs` — artifact-aware operator command that checks the deployed provider-ready manifest against the current bounded pilot before dispatch.

V1 uses the provider-neutral hash-verified static publication manifest under `/media/distribution/publisher/`. Staging and publication identity therefore no longer depend on Metricool paths, IDs, or account limits.

## External setup required once

1. Create or select the TikTok developer app.
2. Add/configure the Content Posting API and request approval for the `video.upload` scope.
3. Configure web OAuth with this exact redirect URI:
   - `https://thehippiescientist.net/api/tiktok/callback`
4. Verify ownership of the URL prefix used for server-side pull:
   - `https://thehippiescientist.net/media/distribution/`
5. In Cloudflare Pages production secrets/variables set:
   - `TIKTOK_CLIENT_KEY`
   - `TIKTOK_CLIENT_SECRET`
   - `TIKTOK_REDIRECT_URI=https://thehippiescientist.net/api/tiktok/callback`
   - `TIKTOK_PUBLISHER_ADMIN_TOKEN` to a long random secret
6. Create a dedicated Cloudflare KV namespace and bind it to Pages Functions as:
   - `TIKTOK_TOKEN_KV`
7. If the artifact-side Publisher command will be run from CI/operator tooling, provide `THS_PUBLISHER_ADMIN_TOKEN` there. The TikTok admin token is reserved for OAuth/connect/status diagnostics, not draft creation.

Never commit the real client secret, publisher admin token, access token, or refresh token.

## One-time account authorization

After the production variables and KV binding exist:

```bash
curl -sS -X POST https://thehippiescientist.net/api/tiktok/connect \
  -H "Authorization: Bearer $TIKTOK_PUBLISHER_ADMIN_TOKEN"
```

The response contains `authorizationUrl`. Open that URL, sign into the target TikTok account, and approve `video.upload`. TikTok redirects back to `/api/tiktok/callback`; the callback stores the access/refresh token bundle server-side in KV.

Check the connection without exposing tokens:

```bash
curl -sS https://thehippiescientist.net/api/tiktok/connection \
  -H "Authorization: Bearer $TIKTOK_PUBLISHER_ADMIN_TOKEN"
```

## Governed draft delivery

The owner control-plane shortcut is a strict issue comment command:

```text
/publish-ths {"experiment_id":"EXP-014","research_object_id":"rhodiola-vs-ashwagandha","publication_at":"2026-10-07T10:00:00-04:00","platform":"tiktok"}
```

That command dispatches the trusted-main `THS Publisher Publication` workflow. It does not call Metricool and does not expose TikTok OAuth credentials to GitHub Actions.


The production/operator path is:

```bash
THS_PUBLISHER_ADMIN_TOKEN="..." \
THS_EXPERIMENT_ID="EXP-014" \
THS_RESEARCH_OBJECT_ID="rhodiola-vs-ashwagandha" \
THS_PUBLICATION_AT="2026-10-07T10:00:00-04:00" \
node scripts/distribution/upload-tiktok-draft.mjs
```

The command creates/enqueues the canonical publication job first, then calls `/api/publisher/dispatch`. `THS_RESEARCH_OBJECT_ID` must exactly match the currently governed deployed opportunity, preventing an experiment ID from being attached to whichever artifact happens to be current. It refuses to dispatch unless:

- the current deployed publication manifest is provider-ready;
- the media is a single governed vertical-video MP4;
- TikTok is an explicitly allowed network;
- the deployed lifecycle ID and identity fingerprint match the current bounded pilot;
- the distribution package is validated and matches the deployed media pack;
- the Publisher runtime accepts only the governed HTTPS MP4 and invokes the TikTok transport server-side.

The Publisher runtime checks that the MP4 is publicly reachable before giving its URL to TikTok. There is no standalone TikTok upload endpoint; creation always requires an existing canonical `publication_id`.

## Status semantics

TikTok returns a `publish_id` when it accepts the upload. That ID is a **dispatch identity**, not proof that anything is public.

Status polling uses TikTok's `/v2/post/publish/status/fetch/` endpoint. For this upload path:

- `PROCESSING_DOWNLOAD` — TikTok is pulling the MP4 from THS.
- `SEND_TO_USER_INBOX` — the draft notification reached TikTok; the user still must finish the post.
- `PUBLISH_COMPLETE` — the user opened the inbox flow and successfully posted from TikTok.
- `FAILED` — the operation failed; inspect the normalized fail reason.

THS Publisher records provider acceptance as `PROVIDER_ACCEPTED`, not `PUBLISHED`. THS Observer promotes only from verified provider evidence; draft delivery alone never becomes publication truth.

## Token lifecycle

TikTok access tokens are short-lived and refresh tokens are longer-lived. The bridge refreshes access tokens server-side when nearing expiration and persists a rotated refresh token when TikTok returns one. This is why the token bundle lives in Cloudflare KV instead of a static GitHub secret.

## Security / failure behavior

The bridge fails closed on missing credentials, missing KV, invalid admin authentication, missing `video.upload`, off-domain/non-governed media, unreachable media, invalid TikTok responses, or invalid publish IDs.

OAuth state is random, stored with a short TTL, and consumed once. Browser-visible code never receives the client secret or stored TikTok tokens.
