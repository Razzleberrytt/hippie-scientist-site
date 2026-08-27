# Evidence → Distribution Engine

## Purpose

The distribution engine turns already-governed TheHippieScientist research into reusable social, infographic, carousel, and short-form-video assets without creating a second scientific or distribution source of truth.

The repository already has the canonical review-only research-distribution path:

- `data/distribution/research-object.schema.json`
- `data/distribution/research-objects.json`
- `scripts/distribution/build-research-distribution.mjs`

Those research objects remain the canonical distribution facts/authoring boundary. The new `schemas/distribution-pack-v1.schema.json`, enforced by `scripts/distribution/distribution-pack-contract.mjs`, is a **downstream rendering contract** for richer visual/video production.

V1 is deliberately a deterministic projection, not a rewriting layer. A valid pack resolves exactly one ID against the canonical research-object registry and must preserve that object's title, destination source page, deterministic content hash, finding, limitation, evidence context, dose context, and population context. The pack's factual public statement is exactly the canonical `finding`; `strengthDelta` is fixed to `none`. Any later paraphrasing system requires a separately governed and independently validated contract rather than self-attestation by the pack producer.

## Authority boundary

Scientific authority remains in the existing canonical workbook, governed evidence records, source registry, approved content paths, and their already-governed projection into research distribution objects. A distribution pack is a traceable rendering projection only.

A renderer, caption generator, narration generator, image model, video model, or publishing adapter MUST NOT:

- strengthen, paraphrase, or substitute the canonical factual finding under the v1 pack contract;
- convert preclinical evidence into human or second-person benefit/efficacy language;
- convert canonical dose/form context into consumer instructions;
- suppress the canonical limitation;
- invent additional source identity, citations, clinical outcomes, regulatory status, or safety conclusions;
- treat generated imagery/video as scientific evidence;
- fork factual copy into a second independently edited distribution dataset.

The current research-object schema does not own a safety field, so v1 packs require `safety: []` rather than manufacturing a safety summary. A richer safety-aware media contract must first receive a canonical upstream safety field/source before it can render safety facts.

## Lifecycle

The intended durable lifecycle is:

`governed evidence → canonical research object → deterministic distribution pack → scientific validation → asset render → asset manifest → ready queue → optional scheduling/publishing → measurement → prioritization feedback`

The existing `build-research-distribution.mjs` remains the owner of current review-only channel packages. Rich media work should extend/consume that path rather than replace it with a competing generator.

Publishing and performance data are downstream observations. They may influence which asset/topic is tried next, but they never alter scientific truth, evidence grade, or claim strength.

## Staleness and provenance

Every pack carries one canonical research-object ID, its canonical source page, and a deterministic SHA-256 hash of the complete canonical research object. Downstream asset manifests must preserve that identity. When the research object changes, the old pack hash no longer validates and dependent assets become stale until regenerated/revalidated.

V1 uses one fixed research-object source binding (`RESEARCH_OBJECT_001`), one factual claim (`CLAIM_001`), and one canonical limitation (`UNCERTAINTY_001`). Asset intents reference `CLAIM_001`; they do not contain alternative factual copy. The CTA is fixed to `Read the evidence` and must point back to the canonical research-object source page.

## Initial implementation sequence

1. Distribution-pack schema and fail-closed validation downstream of the existing research-object contract.
2. Extend the existing research-distribution builder to emit validated packs from canonical research objects.
3. Brand/visual token and deterministic infographic/carousel templates that render pack facts without rewriting them.
4. Asset manifest and durable queue.
5. Programmatic 30-second vertical-video rendering.
6. Narration/caption pipeline only after a separately governed wording contract exists for any non-verbatim factual speech/copy.
7. Optional generative B-roll adapters; generated media is visual input only, never evidence.
8. Search/social opportunity scoring and campaign attribution.
9. Performance feedback.
10. Publishing integrations only after the generated → validated → ready boundary is proven reliable.

The order can change when measured dependency/ROI evidence justifies it, but canonical research-object resolution and factual validation remain upstream of rendering and publishing.