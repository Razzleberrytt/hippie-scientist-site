# Insight Foundry — research-only source-linked contracts

**Implementation status:** admitted under issue #6749 by merged control PR #6754; implementation PR #6762 is under review. The module is not deployed, independently scientifically validated, or authorized for publication.

**Governance:** Authority/Content workstream A, issue #6749. Integration must pass the repository’s normal exact-head checks and protected merge controller. Its code must not publish or grade research automatically.

## Integration intent

This add-only submodule uses no separate research database, build pipeline, scheduler, paid dependency, site route, automated science verdict, or publisher. It defines candidate opportunities, frozen search protocols, research-only case-file validation, and a read-only adapter consuming the existing THS research Studio, semantic graph, and **already verified** `getResearchSourceRegister()` output. The adapter does not itself authenticate source/verification receipts.

When wired, only the existing THS server-side source-register loader may supply `sourceRegister`, and the **actual** imported THS `semanticSourceSignature` must be supplied; the standalone tests use synthetic stand-ins to test contract shape only. A standalone hash is not a PubMed check.

## Tests

From the repository root, run:

```sh
node --test research/insight-foundry/native-tests/*.node.mjs
npm run test:node
```

The existing repo `scripts/run-node-tests.mjs` discovers both files via top-level `node:test` imports. Test filenames are intentionally `.node.mjs`, **not** `.test.mjs`, because Vitest would otherwise discover incompatible native tests. No `package.json`, Vitest configuration, or CI policy modifications are required for discovery.

## Scientific protections

- Exact normalized question + PICO identity, protocol digest and immutable-by-hash case content.
- Protocol-specific database/query/limits search records; completion requires separate, matching externally verified receipts sourced from an approved upstream authority (not user input).
- Research metadata stays ungraded; unreviewed sources must use `direction: not-extracted`. Title co-occurrence is never an effect, novel global finding, or evidence gap.
- Independently reviewed claims must match exact source ID, PMID, graph fingerprint, snapshot and approved effect direction; underlying-trial lineage maps remain separate authorities and cannot be self-attested by the case.
- `publicationStatus: 'not-authorized'` and `scientificGate: 'research-only'` cannot be escalated by this code.

## Limitations

The native synthetic tests verify only local invariants. The separate `scripts/ci/validate-insight-foundry-source-handoff.test.ts` smoke test exercises THS’s actual verified research register in repository CI; neither test type constitutes independent PubMed verification, a completed literature search, scientific review, or permission to publish. The source-register adapter trusts its governed caller and does not independently authenticate arbitrary input objects.
