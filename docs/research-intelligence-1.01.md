# Semantic Research Intelligence 1.01 — witness-first iteration

Canonical implementation: PR #6407, built on the merged source-register and semantic network. PR #6406 implements a competing research intelligence route and should be reconciled, not merged independently into the same path.

## 1.01 improvements

1. **Question coverage contract.** Ask the Evidence treats the controlled vocabulary as partial understanding, not natural-language comprehension. It exposes terms that cannot be interpreted (including negation, population/comparator/dose/time qualifiers). A paper matching all *indexed* concepts is **not** a full-question match if any qualifier remains unresolved. Same-paper conjunctive witnesses remain the default; partial results are labeled.
2. **Same-paper semantic threads.** The Interaction Matrix now shows cross-instrument threads with one literal substance (named in title), outcome and safety context in the **same PMID**. It will not combine unrelated papers into an invented relationship. A thread is a source-inspection lead, not efficacy, interaction or causality.
3. **Governed Content Reactor.** Triple-mention threads create only source-ID-bearing review work orders, never automatic publishing. Other instruments consume the same graph and 500 verified source identities.
4. **Stale-source integrity.** Before deriving fingerprints, the graph's literal title/abstract mentions must equal mentions extracted from the current source text. A graph with valid PMIDs but stale concepts fails closed.
5. **Versioned snapshot admission.** The web interface requires `systemVersion: 1.01`, consistent graph/source identities, and zero automatic claim promotion; it keeps static export and click-to-fetch loading.

## Safeguards and scope

- These projections cover only the exact EFetch-verified 7001–7500 research-intake batch (500 PMIDs); historical PMID-only items and pending enrichment remain outside this semantic subset.
- Bibliographic mentions, graph traversal and triple co-mentions do **not** establish a clinical conclusion or verified interaction.
- Contradiction review uses separately reviewed public citation descriptors; publication independence and endpoint comparability require editorial adjudication.
- The grade-change Time Machine shows only real recorded editorial changes.
- All new cross-instrument work orders require qualified review and cannot auto-publish.
- No new paid services, Cloudflare stateful infra or runtime model credits are required.

## Validation

```bash
node scripts/ci/validate-research-source-register.mjs
npx tsx scripts/ci/validate-research-semantic-network.ts
npx tsx scripts/ci/validate-research-intelligence-studio.ts
npm run typecheck
npm run check:fast
npm run build
```

## Further opportunities for 1.02

- Explicit abstract-sentence span citations, trial-arm and dose extraction with per-field human verification
- Canonical study deduplication across PMIDs/DOIs/registries with cohort-identity checks
- Independent review queue that logs adjudications and rejected hypotheses
- Content-addressed provenance snapshots and schema migration gates
- End-to-end mobile/a11y and production route measurements after deployment

No ROI or improvement percentage is asserted without observed metrics.
