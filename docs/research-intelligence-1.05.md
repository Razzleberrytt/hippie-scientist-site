# Semantic Intelligence 1.05 — source-focused scientific exploration

## Governing records
- Atomic acceptance issue: https://github.com/Razzleberrytt/hippie-scientist-site/issues/6418
- Predecessor: merged Semantic Intelligence v1.04 (#6415)
- Canonical page: `/research/intelligence/`; no second route or new generated dataset
- Earlier versions 1.01–1.04 and the pre-existing research semantic graph remain authoritative

## What 1.05 changes

The eight v1.04 instrument tiles already opened a persistent PMID case panel, but the main lists below them were often **still global**, allowing a reader to mistake unrelated evidence as linked to the selected paper. Version 1.05 binds a single exact-PMID source focus to all instrument result surfaces until the reader selects **Clear focus · explore all sources**.

1. **Study DNA:** restrict fingerprints to the selected PMID. Reset the search when choosing another paper.
2. **Contradiction Observatory:** include only candidate direction-review groups containing separately reviewed citation IDs that are matched by the v1.03 exact PMID/DOI publication-identity crosswalk. Unknown trial independence remains unknown.
3. **Knowledge Frontier:** include only the existing candidate coverage-question samples that explicitly list the PMID. Zero source-linked candidates does not indicate a global literature gap.
4. **Evidence Time Machine:** restrict the publication-year choices and PMID link to the selected source. Prevent unrelated ingredient-level editorial grade-change logs from appearing as if verified against the selected paper.
5. **Semantic Voyages:** while focused, allow only a **single-publication, title-anchored** literal concept co-mention. No multi-paper path may stand in for a missing source-specific relationship.
6. **Interaction Matrix:** restrict safety co-mentions and triple-concept investigation trails to existing sample arrays explicitly containing the PMID. These do not prove adverse reactions or herb–drug interactions.
7. **Ask the Evidence:** query the focused source **before ranking and slicing**, not by filtering an already-truncated global top 12. Expose the focused search scope in the retrieval notice.
8. **Content Reactor:** show only work orders with explicit matching PMID or already-reviewed exact citation identity. Keep source-indexing review history restricted to the PMID. No autonomous publishing.

## Architecture and limits

- `lib/research-intelligence-context.ts` creates a deterministic, easily tested, read-only source-filtered view.
- It checks research-only governance, source identity, and agreement between a case's citation IDs and the *canonical, separately constructed publication cross-reference*. Stale/fabricated IDs fail closed.
- Existing `lib/research-intelligence-casefile.ts` and `lib/research-intelligence-studio.ts` are upgraded to the same 1.05 data version; the client rejects stale 1.04 asset mixes.
- Static `/research/intelligence/dataset.json` keeps the 500-paper source-only cohort from Waves 7001–7500. The later draft batch must pass its own independent scientific/source review; no merging of unreviewed intake into public claims.
- No new server, paid API, runtime model, background process, search-index provider, trial coalescing, dosing guidance, or clinical recommendation engine.

## Verification
```bash
npx tsx scripts/ci/validate-research-intelligence-studio.ts
npm run typecheck
npm run check:fast
npm run build
```
CI includes intentionally adversarial cases: unrelated-PMID questions, omitted identifiers, forged reviewed citation crosslinks, disjoint semantic concepts, source case subset integrity and production source-registry gates.

**Before → after measurement:** Before, global result lists were displayed despite an open case file. After target, 8/8 instrument contexts follow selected source identity with one explicit reset. Verified 500-paper cohort: 500 → 500. Automatic clinical promotions and article publications: 0 → 0. Audience, retention, conversion or CPU uplift: **unknown until production telemetry**.

Deployment to Cloudflare is not established by merging alone; the canonical deployment receipt must match the exact merge commit before treating the change as publicly live.

## Integration with the rolling-research coordinator

The October 8 rolling research coordinator on the newer main branch adds a separately governed, reviewed semantic overlay when constructing the research graph. Version 1.05 does **not** replace that graph construction or the review boundary: its source-focus projection consumes the resulting governed graph and publication-lineage crosswalk read-only. An unrelated rolling intake reservation or a pending 500-record research batch is not authorization to expand the 500-source Science Atlas snapshot. All exact-head checks must validate against the refreshed main branch before this upgrade is merged.

## Eight-instrument interoperability contract

An explicit `ResearchInstrumentHandoff` passes only: exact PMID, pinned semantic-source signature, controlled concept IDs, exact reviewed-citation IDs, origin instrument, destination instrument and a research-only status. The destination recreates the source case and scoped leads from the canonical snapshot before showing anything. **All 8 × 8 = 64 directions** are exercised in regression, including source-only cases. Fabricated PMIDs, stale signatures, synthetic citation IDs and foreign semantic concepts fail closed.

Both the eight case-grid cards and the primary instrument selector use this same verified transition mechanism. The workbench provides a visible, reversible receipt of the selected source and a limited list of neighboring *bibliographic vocabulary* connections; following one changes the source case without conflating the two publications. No cross-instrument navigation creates new efficacy, safety or independent-trial findings.

## Deployment blockers repaired

- Seven `scripts/research/*.test.mjs` suites import `node:test`, not Vitest. The Vitest project excludes them and the existing repository-wide `npm run test:node` still discovers and runs them. These tests are **not removed or bypassed**.
- The v1.04 main CI production build failed on three heavyweight static export routes exceeding Next's 60-second per-page deadline under concurrency. GitHub Actions now caps Next's static-generation concurrency to **two pages per worker** (four workers retained); other build hosts remain unchanged. No route, SEO, source or publication gate is skipped. The measured next production-build result, not speculation, determines release readiness.
- An October 8 reviewed semantic overlay from the rolling research coordinator is retained on the refreshed main base. Source-specific views always derive from the returned governed graph rather than rebuilding a separate, inconsistent semantic authority.

Production can be called current only when the deployed `/.well-known/deployment.json` commit matches the exact accepted merge SHA and the served intelligence JSON returns `systemVersion: "1.05"`. A green PR without a green main CI and production receipt is **not deployed**.
