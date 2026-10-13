# Insight Foundry — research-only source-linked contracts

**Implementation status:** standalone, reviewed-at-code-level only; NOT scientific review, code admission, a deployed feature, or independent evidence verification.

**Admitted owner needed:** issue #6749 and protected merge of control PR #6754 are required before this source is committed to the THS repo.

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
- Research metadata stays ungraded; title co-occurrence is never an effect, novel global finding, or evidence gap.
- Independently reviewed claim and underlying-trial lineage maps remain separate authorities and cannot be self-attested by the case.
- `publicationStatus: 'not-authorized'` and `scientificGate: 'research-only'` cannot be escalated by this code.

## Limitations

The 62 synthetic tests verify only local invariants. They are not live external search receipts, publication review, or actual THS integration tests. That requires a separately governed CI run against canonical source register and genuine sources, followed by mandatory release gates.
