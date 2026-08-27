# Evidence → Distribution Engine

## Purpose

The distribution engine turns already-governed TheHippieScientist research into reusable social, infographic, carousel, and short-form-video assets without creating a second scientific or distribution source of truth.

The repository already has the canonical review-only research-distribution path:

- `data/distribution/research-object.schema.json`
- `data/distribution/research-objects.json`
- `scripts/distribution/build-research-distribution.mjs`

Those research objects remain the canonical distribution facts/authoring boundary. The new `schemas/distribution-pack-v1.schema.json`, enforced by `scripts/distribution/distribution-pack-contract.mjs`, is a **downstream rendering contract** for richer visual/video production. Every pack must identify the canonical research-object IDs from which it was derived, and every factual claim must retain lineage to at least one declared `research-object` source.

## Authority boundary

Scientific authority remains in the existing canonical workbook, governed evidence records, source registry, approved content paths, and their already-governed projection into research distribution objects. A distribution pack is a traceable rendering projection only.

A renderer, caption generator, narration generator, image model, video model, or publishing adapter MUST NOT:

- strengthen an evidence claim;
- convert preclinical evidence into human efficacy;
- convert study-context dose/duration into consumer instructions;
- suppress material uncertainty, null/mixed findings, or safety boundaries required by the upstream research object/pack;
- invent source identity, citations, clinical outcomes, regulatory status, or safety conclusions;
- treat generated imagery/video as scientific evidence;
- fork factual copy into a second independently edited distribution dataset.

## Lifecycle

The intended durable lifecycle is:

`governed evidence → canonical research object → distribution pack → scientific validation → asset render → asset manifest → ready queue → optional scheduling/publishing → measurement → prioritization feedback`

The existing `build-research-distribution.mjs` remains the owner of current review-only channel packages. Rich media work should extend/consume that path rather than replace it with a competing generator.

Publishing and performance data are downstream observations. They may influence which asset/topic is tried next, but they never alter scientific truth, evidence grade, or claim strength.

## Staleness and provenance

Every pack carries canonical research-object IDs, a canonical source page, and a SHA-256 source-content hash. Downstream asset manifests must preserve that identity. When a material source/research-object payload changes, dependent assets should become stale until regenerated/revalidated rather than silently remaining current.

Every factual claim carries stable claim IDs and explicit source bindings. Asset intents refer to claim IDs rather than copying untracked prose into a parallel content system.

## Initial implementation sequence

1. Distribution-pack schema and fail-closed validation downstream of the existing research-object contract.
2. Extend the existing research-distribution builder to emit validated packs from canonical research objects.
3. Brand/visual token and deterministic infographic/carousel templates.
4. Asset manifest and durable queue.
5. Programmatic 30-second vertical-video rendering.
6. Narration/caption pipeline.
7. Optional generative B-roll adapters.
8. Search/social opportunity scoring and campaign attribution.
9. Performance feedback.
10. Publishing integrations only after the generated → validated → ready boundary is proven reliable.

The order can change when measured dependency/ROI evidence justifies it, but canonical research-object lineage and factual validation remain upstream of rendering and publishing.
