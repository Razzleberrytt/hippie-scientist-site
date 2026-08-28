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

For each valid research object, the existing `artifacts/distribution` family gains `<id>.media-pack.json`. The existing review-only channel package and manifest reference that validated pack by `packId`, content hash, artifact name, and `validated` state. Existing X/Instagram/video/email/article outputs remain review-only; no publishing automation is activated.

Creative/presentation code may not become a second factual authority, and generative media remains non-authoritative visual input only.

## Governed asset lifecycle

`distribution-lifecycle.mjs` is the Lane-5 orchestration boundary after validated rendering. It does not publish by itself and does not duplicate factual, creative, rendering, opportunity, or measurement authority.

A lifecycle identity is bound to the exact research-object hash, validated pack/content hash, creative-spec hash, rendered asset-manifest hash, canonical source URL, tagged destination, platform, format, and campaign ID. Any upstream identity drift invalidates the record and requires regeneration before another transition.

The v1 state contract is `generated → validated → ready → scheduled → published → measured`, with explicit `paused` and `withdrawn` stop paths. Transitions fail closed when skipped or stale. Scheduling/publishing is dry-run by default. Real provider transitions must name the provider, and a real publish cannot be recorded as successful without a confirmed provider `externalId`; dispatch/request IDs alone are not success.

Every publication transition carries the deterministic idempotency key and upstream identity fingerprint so retries cannot silently mint a second campaign identity. Measurements are recorded as observation-only lifecycle data and cannot modify scientific claims, evidence grades, limitations, source identity, safety truth, or canonical content.

Broad/high-volume autopublishing remains unauthorized. Provider adapters and bounded live pilots are separate opt-in work after this lifecycle contract, exact-head validation, credential/provider configuration, and rollback proof.
