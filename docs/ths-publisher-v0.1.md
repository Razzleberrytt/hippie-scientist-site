# THS Publisher v0.1

## Purpose

THS Publisher makes publication identity and operational state first-party THS data instead of provider data.

The canonical identity chain is:

`publication_id → experiment_id → artifact_sha256 → platform → intended_time → provider receipts`

The first five fields are immutable THS identity. Provider post IDs, planner IDs, API request IDs, TikTok `publish_id` values, and public URLs are receipts attached to that identity. A provider can change or disappear without changing the canonical publication.

## Architecture

### 1. THS SocialOS — control plane

The Social Learning Playbook and the Social Topic Opportunity Queue workbook remain authoritative for:

- topics and prioritization;
- experiment identity and hypotheses;
- scheduler/creation locks;
- Creative QA and media preflight;
- attribution and journeys;
- cooldowns and learning;
- system-version and rule registries.

The workbook now has a **Publication Registry** tab that mirrors first-party publication state for operators. Historical Metricool rows remain historical evidence; they are not rewritten or deleted.

### 2. THS Publisher — publication engine

Provider-neutral identity creation lives in `scripts/distribution/social-publisher-core.mjs`. Runtime transitions are owned only by `functions/_shared/social-publisher-runtime.ts`; operator scripts call the authenticated runtime endpoints rather than mutating stored jobs themselves.

A job is created only from an exact governed artifact identity. Its deterministic `publication_id` is derived from:

- `experiment_id`;
- `artifact_sha256`;
- platform;
- normalized intended time.

The D1-backed service lives behind `/api/publisher/*` and stores whole publication jobs plus indexed immutable identity fields.

Current endpoints:

- `POST /api/publisher/enqueue` — idempotently persist a publication job.
- `GET /api/publisher/job?publication_id=...` — fetch canonical state.
- `GET /api/publisher/due?limit=...` — list due **QUEUED** work only.
- `POST /api/publisher/dispatch` — execute the registered platform adapter.
- `POST /api/publisher/observe` — verify provider state and advance only from evidence.
- `POST /api/publisher/reconcile` — resolve crash/transport ambiguity with explicit operator evidence without rewriting the original attempt.
- `POST /api/publisher/manual` — attach a verified manual-publication receipt to the same canonical job.
- `POST /api/publisher/cancel` — cancel only jobs that cannot have unresolved provider side effects.

All endpoints require `Authorization: Bearer $THS_PUBLISHER_ADMIN_TOKEN`.

The D1 schema is `migrations/0001_ths_publisher.sql`. A partial unique index on `(platform, intended_time)` enforces one non-cancelled writer for each publication slot. Cancelling a never-sent/definitely-failed job releases the slot; ambiguous or provider-accepted jobs cannot be cancelled. Replays of the same `publication_id` are idempotent.

### 3. THS Observer — publication verification

Observer evidence is append-only inside the publication job. Provider acceptance never equals public publication.

For TikTok:

- draft initialization → `PROVIDER_ACCEPTED`;
- verified `SEND_TO_USER_INBOX` → `AWAITING_USER_POST`;
- verified `PUBLISH_COMPLETE` plus a public post identity → `PUBLISHED`;
- verified provider failure → `FAILED`.

Post-level performance metrics remain separate from publication truth and feed the existing Experiment Registry / observation pipeline only after publication identity is verified.

Website attribution remains a separate fail-closed layer until first-party analytics transport exists.

## State machine and retry rules

Primary states:

`QUEUED → DISPATCHING → PROVIDER_ACCEPTED → AWAITING_USER_POST → PUBLISHED`

Failure/control states:

- `FAILED` — a definite rejection/failure was observed.
- `NEEDS_RECONCILIATION` — the request may have reached the provider but THS did not receive a definitive response.
- `CANCELLED` — operator/system cancelled before public publication.

A process crash can also leave a job in `DISPATCHING`. Neither `DISPATCHING` nor `NEEDS_RECONCILIATION` is auto-retried. An authenticated reconciliation must explicitly record one of three evidence-backed outcomes: `not_sent` (safe to retry under the same identity), `provider_accepted` (attach the recovered provider operation ID), or `published` (attach verified public publication evidence). The reconciliation receipt is append-only; it does not erase the original ambiguous attempt.

The critical retry rule is:

> **Never retry an ambiguous dispatch.**

A connection failure after bytes were sent can mean the provider accepted the post while THS lost the response. That job becomes `NEEDS_RECONCILIATION`, and automated due-work selection excludes it. This prevents duplicate posts.

Failures proven to occur **before** a provider dispatch may be retried explicitly, and the retry remains under the same `publication_id` with another appended attempt. Once a TikTok upload request may have begun, transport loss, provider 5xx, unusable response, or missing `publish_id` is treated as ambiguous and freezes in `NEEDS_RECONCILIATION` instead of retrying.

## Adapter registry

### TikTok

TikTok draft upload is the first active adapter. It uses the official Content Posting API `video.upload` / `PULL_FROM_URL` path and the server-side OAuth/token bridge documented in `docs/tiktok-draft-upload-provider.md`.

This adapter does not claim unattended Direct Post approval.

### Meta / Facebook

Not yet active in v0.1. Until the Meta adapter is implemented and authorized, Facebook can be published manually from the exact locked artifact and recorded through the manual receipt endpoint.

### Metricool

**Frozen as a canonical publisher.**

Historical Metricool provider IDs, URLs, publication evidence, and analytics remain valid historical observations. Both Metricool publication workflows and the executable scheduling CLI are hard-frozen; lower-level provider/measurement code is retained only for historical reproducibility, analytics continuity, and rollback archaeology. New SocialOS identity must not depend on Metricool IDs or planner state.

If Metricool is used again, it must be registered as a replaceable Publisher adapter and return receipts beneath an existing `publication_id`.

## Operator entry point

Trusted owner publication uses `.github/workflows/ths-publisher-publication.yml`, directly or through the owner-only `/publish-ths` issue-comment bridge. The request must identify the experiment, exact research-object ID, platform, and offset-aware intended time. The workflow rebuilds the current governed identity, refuses a research-object mismatch, enqueues the canonical job, and delegates dispatch to the server runtime.

GitHub Actions receives only `THS_PUBLISHER_ADMIN_TOKEN`; TikTok client credentials and user tokens remain inside Cloudflare.

## Deployment


Cloudflare production needs:

- D1 database binding: `THS_PUBLISHER_DB`
- server-only secret: `THS_PUBLISHER_ADMIN_TOKEN`

Apply `migrations/0001_ths_publisher.sql` to that D1 database before enabling enqueue/dispatch.

The TikTok adapter additionally needs the TikTok bridge configuration documented separately:

- `TIKTOK_CLIENT_KEY`
- `TIKTOK_CLIENT_SECRET`
- `TIKTOK_REDIRECT_URI`
- `TIKTOK_TOKEN_KV`
- one-time TikTok account authorization with `video.upload`

## Transition plan

1. Freeze Metricool as a canonical transport dependency.
2. Preserve historical Metricool receipts and analytics unchanged.
3. Create `publication_id` before every new provider/manual handoff.
4. Queue only exact locked/preflighted artifacts.
5. Use the direct adapter where authorized; otherwise publish that exact artifact manually and attach the receipt.
6. Observer verifies public state before learning begins.
7. Post-level platform observations feed Experiment Registry under the verified publication identity.
8. Website attribution remains Unknown until its own transport is available.

## v0.1 non-goals

- No deletion or rewriting of historical Metricool evidence.
- No broad/high-volume autonomous posting authorization.
- No Meta adapter yet.
- No TikTok Direct Post workaround.
- No scientific, evidence, or creative authority moves into Publisher.
- No claim that a provider dispatch is public publication.
