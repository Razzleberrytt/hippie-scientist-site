# Evidence → Distribution Engine

## Purpose

The distribution engine turns already-governed TheHippieScientist content into reusable social, infographic, carousel, and short-form-video inputs without creating a second scientific source of truth.

The first contract is `schemas/distribution-pack-v1.schema.json`, enforced by `scripts/distribution/distribution-pack-contract.mjs`.

## Authority boundary

Scientific authority remains in the existing canonical workbook, governed evidence records, source registry, and approved content paths. A distribution pack is a traceable projection for media production only.

A renderer, caption generator, narration generator, image model, video model, or publishing adapter MUST NOT:

- strengthen an evidence claim;
- convert preclinical evidence into human efficacy;
- convert study-context dose/duration into consumer instructions;
- suppress material uncertainty, null/mixed findings, or safety boundaries required by the pack;
- invent source identity, citations, clinical outcomes, regulatory status, or safety conclusions;
- treat generated imagery/video as scientific evidence.

## Lifecycle

The intended durable lifecycle is:

`source → distribution pack → scientific validation → asset render → asset manifest → ready queue → optional scheduling/publishing → measurement → prioritization feedback`

Publishing and performance data are downstream observations. They may influence which asset/topic is tried next, but they never alter scientific truth or evidence strength.

## Staleness and provenance

Every pack carries a canonical source page and SHA-256 content hash. Downstream asset manifests must preserve that identity. When a material source payload changes, dependent assets should become stale until regenerated/revalidated rather than silently remaining current.

Every factual claim carries stable claim IDs and explicit source bindings. Asset intents refer to claim IDs rather than copying untracked prose into a parallel content system.

## Initial implementation sequence

1. Distribution-pack schema and fail-closed validation.
2. Governed claim/source extraction into packs.
3. Brand/visual token and deterministic infographic/carousel templates.
4. Asset manifest and durable queue.
5. Programmatic 30-second vertical-video rendering.
6. Narration/caption pipeline.
7. Optional generative B-roll adapters.
8. Search/social opportunity scoring and campaign attribution.
9. Performance feedback.
10. Publishing integrations only after the generated → validated → ready boundary is proven reliable.

The order can change when measured dependency/ROI evidence justifies it, but factual validation remains upstream of rendering and publishing.
