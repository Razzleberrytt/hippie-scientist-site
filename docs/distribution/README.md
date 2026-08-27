# Evidence → Distribution engine

The distribution engine is a downstream consumer of governed site content. It is **not** a scientific source of truth.

## Contract

A distribution pack contains:

- the canonical source URL and a source-content hash;
- governed factual claims with per-claim provenance;
- a deterministic factual-payload hash;
- campaign/UTM identity;
- asset manifest entries bound to the same factual hash;
- a fail-closed queue lifecycle: `generated → validated → ready → scheduled → published → measured`.

If governed claims or qualifications change, the factual hash changes and previously rendered assets fail validation as stale. Creative renderers and generative B-roll providers may decorate a pack, but they may not add factual claims, doses, safety statements, evidence grades, or citations.

## MVP path

1. Extract a governed factual payload from one canonical source page.
2. Build and validate a distribution pack.
3. Deterministically render an infographic/carousel from that payload.
4. Deterministically render a 30-second vertical-video package using the same payload and provenance hash.
5. Advance only validated assets into the publishing queue.
6. Attach campaign IDs to outbound links and ingest measured results without mutating scientific content.

`scripts/distribution/lib/distribution-pack.mjs` is the first shared infrastructure boundary. Rendering, narration, provider adapters, storage and publishing should depend on this contract rather than re-reading or inventing scientific facts independently.
