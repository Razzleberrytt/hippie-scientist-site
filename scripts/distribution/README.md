# Distribution pack contract

`distribution-pack-contract.mjs` is the fail-closed runtime validator for `schemas/distribution-pack-v1.schema.json`.

Downstream renderers should call `assertValidDistributionPack(pack)` before using a pack. A structurally valid-looking pack is not sufficient if it violates scientific/provenance invariants such as unknown source bindings, claim strengthening, consumer-dose directives, unlabeled preclinical evidence, duplicate provenance IDs, or asset references to unknown claims.

This layer does not extract evidence yet and does not render or publish media. It is the boundary that later extraction/rendering/publishing stages must consume.
