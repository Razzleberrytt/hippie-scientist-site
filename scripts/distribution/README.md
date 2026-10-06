# Distribution pack contract

`distribution-pack-contract.mjs` is the fail-closed runtime validator for `schemas/distribution-pack-v1.schema.json`.

V1 is intentionally narrow. A pack is not an independent scientific or marketing-facts document: it must resolve exactly one ID against the canonical `data/distribution/research-objects.json` registry and reproduce the trusted research object's factual fields rather than paraphrasing them.

`assertValidDistributionPack(pack)` therefore checks both structure and provenance. By default it resolves against the repository's canonical research-object registry; tests may inject an explicit registry fixture. The gate verifies the canonical object exists and requires the pack to preserve its title, source page, deterministic object hash, finding, limitation, evidence context, dose context, and population context.

V1 deliberately permits:

- one canonical research-object source;
- one factual claim whose `sourceStatement` and `publicSafeStatement` equal the canonical `finding`;
- one uncertainty equal to the canonical `limitation`;
- no added safety assertions because the current research-object contract does not own a safety field;
- fixed no-strengthening / no-consumer-dose / no-preclinical-human-projection boundaries;
- asset intents that reference the canonical claim but contain no factual rewrite.

It rejects fabricated research-object IDs, stale hashes, extra sources, free-form claim rewrites, consumer-dose directives (including numeric dosage forms), preclinical human/second-person benefit projection, altered study context, weakened limitations/guardrails, and schema-invalid fields.

## Canonical builder integration

`build-distribution-pack.mjs` deterministically projects one canonical research object into the v1 pack and immediately validates it against the same canonical research-object registry.

`build-research-distribution.mjs` remains the single distribution generator. It now prepares and validates every media pack before creating the output directory or writing any artifact. A failed or ambiguous pack therefore aborts the run without leaving a partially updated artifact set.

For each valid research object, the existing `artifacts/distribution` family gains `<id>.media-pack.json`. The existing review-only channel package and manifest reference that validated pack by `packId`, content hash, artifact name, and `validated` state. Existing X/Instagram/video/email/article outputs remain review-only unless a separately governed provider path consumes an already-validated asset.

Creative/presentation code may not become a second factual authority, and generative media remains non-authoritative visual input only.

## Governed asset lifecycle

`distribution-lifecycle.mjs` is the Lane-5 orchestration boundary after validated rendering. It does not publish by itself and does not duplicate factual, creative, rendering, opportunity, or measurement authority.

A lifecycle identity is bound to the exact research-object hash, validated pack/content hash, creative-spec hash, rendered asset-manifest hash, canonical source URL, tagged destination, platform, format, and campaign ID. Any upstream identity drift invalidates the record and requires regeneration before another transition.

The v1 state contract is `generated → validated → ready → scheduled → published → measured`, with explicit `paused` and `withdrawn` stop paths. Transitions fail closed when skipped or stale. Scheduling/publishing is dry-run by default. Real provider transitions must name the provider, and a real publish cannot be recorded as successful without a confirmed provider `externalId`; dispatch/request IDs alone are not success.

Every publication transition carries the deterministic idempotency key and upstream identity fingerprint so retries cannot silently mint a second campaign identity. Measurements are recorded as observation-only lifecycle data and cannot modify scientific claims, evidence grades, limitations, source identity, safety truth, or canonical content.

## THS Publisher v0.1

`social-publisher-core.mjs` defines the provider-neutral publication identity and state machine. A canonical `publication_id` is derived from experiment ID, exact artifact SHA-256, platform, and intended time before any provider is called. Provider operation IDs are receipts beneath that identity.

The Cloudflare Publisher service persists jobs in D1 behind `/api/publisher/*`. `THS_PUBLISHER_DB` is the durable queue binding and `THS_PUBLISHER_ADMIN_TOKEN` protects its operator/service endpoints. The D1 schema enforces one non-cancelled publication owner per platform/time slot; safe cancellation releases an unused slot.

Retries remain under the same `publication_id`. Definite failures may be retried explicitly; ambiguous transport outcomes become `NEEDS_RECONCILIATION` and are excluded from automatic due-work selection. Provider acceptance, inbox delivery, and public publication are separate states.

`tiktok-publisher-adapter.mjs` is the first active transport/Observer adapter. Meta is not yet active. Manual publication of the exact locked artifact can be recorded as a provider receipt without changing canonical identity.

See `docs/ths-publisher-v0.1.md`.

## Legacy bounded Metricool adapter — frozen for new canonical publishing

Metricool remains available only for historical reproducibility and bounded rollback while THS Publisher replaces it as publication control. Existing receipts and analytics remain valid observations. New publication identity must not depend on Metricool post IDs, planner state, or account availability.


`stage-publication-media.mjs` stages only hash-verified governed media under the provider-neutral static path `/media/distribution/publisher/`. The production deploy regenerates the current bounded pilot and requires its provider-ready manifest to be present in the final static export. Deployment itself never schedules or publishes a post.

`metricool-provider.mjs` is the provider boundary. It accepts only explicit supported networks, future publication times, governed copy, and canonical HTTPS media URLs. The current carousel path is limited to Facebook and TikTok. YouTube is supported only by the vertical-video provider contract because it requires video media.

`.github/workflows/metricool-publication.yml` is retained only as a legacy/manual-delivery path. `autoPublish=true` is rejected while Metricool is frozen. It regenerates the exact current governed pilot, confirms the deployed media identity is current, verifies every public media URL is reachable, then calls Metricool server-side. When the legacy adapter is used, its token remains server-side and is never written to source, artifacts, receipts, or logs.

A dry-run `scheduled` lifecycle may be promoted to a real Metricool `scheduled` receipt only after Metricool returns a provider post ID. Scheduling is not recorded as publication; `published` still requires separate provider confirmation. Stale identity, missing credentials, unsupported network/format combinations, invalid media URLs, or past timestamps fail closed before a provider transition is accepted.

Broad/high-volume autopublishing remains unauthorized. The Metricool adapter is legacy/optional transport for already-governed assets, not a control-plane dependency and not permission to bypass evidence, safety, provenance, channel-policy, lifecycle, measurement, or scaling gates.


## First-party TikTok draft upload

`tiktok-upload-provider.mjs` adds an independent TikTok transport for already-governed vertical-video assets. It uses the site's Cloudflare bridge and TikTok Content Posting API `video.upload` to deliver a draft into the creator's TikTok inbox. It is deliberately **not** Direct Post and never treats provider acceptance as public publication.

`upload-tiktok-draft.mjs` is the artifact-aware operator boundary. It rechecks the live provider-ready static media manifest against the current selected opportunity, validated package, bounded pilot lifecycle ID, and identity fingerprint before calling the provider. The current v1 consumes the provider-neutral hash-verified static video staging path under `/media/distribution/publisher/`. The operator command enqueues canonical identity first and delegates all state mutation to the authenticated Publisher runtime.

The Cloudflare bridge owns OAuth exchange, access-token refresh, rotated refresh-token persistence, canonical media URL enforcement, draft initialization via `PULL_FROM_URL`, and status polling. Secrets and TikTok tokens never belong in lifecycle receipts or source control.

See `docs/tiktok-draft-upload-provider.md` for the external TikTok/Cloudflare setup and one-time authorization flow.
