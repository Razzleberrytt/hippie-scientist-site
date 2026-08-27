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

This layer does not yet render or publish media. The next legal milestone is to extend the existing `build-research-distribution.mjs` path to emit this deterministic pack from a canonical research object; it must not create a second distribution generator or facts dataset.