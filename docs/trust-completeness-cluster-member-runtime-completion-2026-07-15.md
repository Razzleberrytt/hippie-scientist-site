# Cluster-Member Runtime Trust Completion — 2026-07-15

## Executive summary

The four `cluster_member_runtime` profiles are trust-complete. The implementation preserves the existing workbook/runtime schema and establishes one deterministic resolver for workbook-generated core records plus validated legacy overlays. It resolves all 11 structured safety gaps, all 10 runtime defects, all four rendering defects, and all four historical audit false positives without changing the completed 89-profile primary-runtime contract.

The two compound profiles that were still treated as deprecated aliases are now active, self-canonical static pages. The production export remains 1,187 generated pages; the active runtime route manifest increased from 415 to 417 routes and the production sitemap increased by two entries to 735 because those compound URLs are no longer suppressed by redirects.

## Reproduced baseline

Work began from clean `main` at `588c07d41`, the merge commit for PR #2300. `origin/main`, local `main`, and `HEAD` matched before the feature branch was created. The inheritance-aware audit reproduced the discovery report exactly:

| Discovery category | Reproduced |
| :--- | ---: |
| Cluster-member profiles | 4 |
| Structured safety gaps | 11 |
| Runtime defects | 10 |
| Rendering defects | 4 |
| Existing-audit false positives | 4 |

There was no baseline divergence, generated-artifact drift, or nondeterministic count change.

## Record-level remediation matrix

There is no declared cross-entity parent relationship in the current workbook. “Canonical” below therefore means the profile's own workbook-generated core runtime record, not a newly inferred herb/compound parent. This independently verified constraint prevented an unsupported relationship from being invented merely to satisfy the audit.

| Canonical record | Cluster identifier | Source | Inherited core fields | Valid local/runtime additions | Missing structured fields at baseline | Runtime defects | Rendering defect | Historical false positive | Evidence limitation | Final remediation | Tests |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `green-tea-extract` (herb core) | `green-tea-extract` | `Entity_Master` row 129 | identity, safety aliases, contraindications, interactions, evidence, trust/visibility | source-backed adverse-effect summary from the narrow runtime trust config | evidence label; adverse effects | generic detail safety override; duplicated interactions | generic FAQ/schema safety | source-only audit ignored valid runtime inheritance | concentrated extracts differ from brewed tea; rare-event evidence is limited | evidence-labelled workbook safety, normalized interactions, configured adverse-effect summary, protected trust fields | resolver, runtime, audit, export, browser |
| `turmeric` (herb core) | `turmeric` | `Entity_Master` row 280 | identity, safety aliases, contraindications, interactions, evidence, trust/visibility | source-backed adverse-effect summary from the narrow runtime trust config | evidence label; contraindications; adverse effects | generic detail safety override; duplicated interactions | generic FAQ/schema safety | source-only audit ignored valid runtime inheritance | trials are short-term and preparation-specific; existing cautions remain precautionary | evidence-labelled workbook safety, prose contraindications, normalized interactions, configured adverse-effect summary | resolver, runtime, audit, export, browser |
| `green-tea-egcg-isolated` (compound core) | `green-tea-egcg-isolated` | `Entity_Master` row 559 | identity, safety aliases, contraindications, interactions, evidence, trust/visibility | source-backed adverse-effect summary from the narrow runtime trust config | evidence label; contraindications; adverse effects | generic detail safety override; trust/visibility overwrite; incorrect search safety flags | generic FAQ/schema safety plus deprecated-route rendering | source-only audit ignored valid runtime inheritance | concentrated EGCG safety is dose/preparation specific; no universal safe supplemental dose is asserted | evidence-labelled core safety, prose contraindications, protected visibility, corrected search flags, restored self-canonical page | resolver, runtime, audit, export, browser |
| `green-tea-extract-egcg` (compound core) | `green-tea-extract-egcg` | `Entity_Master` row 560 | identity, safety aliases, contraindications, interactions, evidence, trust/visibility | source-backed adverse-effect summary from the narrow runtime trust config | evidence label; contraindications; adverse effects | generic detail safety override; trust/visibility overwrite; incorrect search safety flags | generic FAQ/schema safety plus deprecated-route rendering | source-only audit ignored valid runtime inheritance | concentrated extract evidence does not transfer automatically to brewed tea or food use | evidence-labelled core safety, prose contraindications, protected visibility, corrected search flags, restored self-canonical page | resolver, runtime, audit, export, browser |

## Inheritance rules: before and after

Before this work, summary and detail layers used independent shallow merges. Empty or generic detail values could replace valid core safety, trust, and visibility fields; arrays were not consistently normalized; search generation used different fallback logic; and the audit inspected structurally local fields without resolving the production contract.

After this work, `lib/runtime-record-resolver.mjs` is the shared contract used by runtime detail resolution, summary-index generation, search generation, and the cluster audit:

1. Resolve the exact workbook-generated core record and require its canonical relationship to exist.
2. Accept a local override only when the field is permitted and the value is structurally valid.
3. Treat empty strings, placeholders, generic safety copy, and malformed list values as absent; they cannot suppress valid core data.
4. Preserve core-owned identity, trust, visibility, evidence labels, uncertainty language, and cluster-specific safety text unless an explicitly approved valid override exists.
5. Normalize list fields by trimming and case-insensitive deterministic deduplication; never concatenate scalar and array encodings accidentally.
6. Synchronize the supported safety aliases (`safety`, `runtime_safety`, `safetyNotes`, and `safety_notes`) from the resolved value.
7. If neither a valid local value nor a valid core value exists, report an actionable malformed/missing relationship or preserve an explicit evidence-limited value. Never synthesize “none known.”

Non-cluster records retain the prior merge behavior, limiting regression risk to completed primary-runtime work.

## Structured safety gap reconciliation (11/11)

| Finding | Records | Resolution | Source of truth |
| :--- | :--- | :--- | :--- |
| Missing evidence label (4) | all four | Added explicit, uncertainty-preserving evidence labels to `runtime_safety`; resolver preserves the label through all layers | workbook patch; green-tea and turmeric systematic-review sources recorded in the patch |
| Missing/weak structured contraindications (3) | turmeric; both compound profiles | Replaced token/placeholder values with bounded prose already supported by the source record and its safety context | workbook `Entity_Master` |
| Missing adverse-effect output (4) | all four | Added source-backed adverse-effect summaries through the existing runtime `side_effects` field using the narrow four-record config because the workbook sheet has no `side_effects` column | `config/cluster-member-runtime-trust.mjs` plus cited patch provenance |

No medication-interaction field was added, and no contraindication, warning, adverse-effect, or evidence field was overloaded to simulate one.

## Runtime defect reconciliation (10/10)

| Finding | Count | Resolution and regression boundary |
| :--- | ---: | :--- |
| Generic detail safety overwrote the core safety contract | 4 | shared resolver rejects generic/empty/malformed trust overlays; all four profile runtime tests assert the resolved safety |
| Detail layers overwrote compound trust/visibility fields | 2 | protected core-owned trust fields and asserted public `cluster_member_runtime` output for both compounds |
| Herb interaction arrays duplicated values during layer merge | 2 | deterministic list normalization and semantic deduplication |
| Compound search flags contradicted their resolved safety fields | 2 | search builder derives flags from the resolved record rather than layer-local booleans |

Two additional production route-contract manifestations were found while verifying the reported compound rendering defects: deprecated route constants, required redirect assertions, SEO redirect overrides, and metadata exclusions still treated the compound profiles as aliases. Those stale contracts were removed and are now rejected by both the source audit and built-export validator.

## Rendering defect reconciliation (4/4)

Each profile's generic FAQ/schema safety output now receives the same resolved profile-specific safety contract as the visible page. Empty sections remain suppressed, safety aliases cannot create duplicate sections, evidence labels are visible, and malformed/generic placeholders cannot leak into the export.

Manual verification also found and fixed duplicated formatter output (`Use caution caution` and doubled terminal punctuation). Finally, the four governed routes are excluded from the generic post-build content-depth injector. That injector mutates HTML after React serialization; excluding these profiles prevents generic copy from diverging from their trust contract and prevents hydration replacement. The export validator enforces all of these conditions.

## Existing-audit false-positive reconciliation (4/4)

The previous fill-rate audit inspected only workbook-local safety text and classified each of the four profiles as incomplete despite valid runtime inheritance. It now resolves the same core-plus-overlay contract as production and reports a separate deterministic cluster-member result. Fixtures cover each historical profile. Invalid empty overrides, malformed arrays, missing canonical relationships, and synthetic true gaps still fail. Strict mode exits nonzero only for actionable defects and prints the classification behind every profile result.

## Files changed

- Runtime contract: `config/cluster-member-runtime-trust.mjs`, `lib/runtime-record-resolver.mjs`, `src/lib/runtime-data.ts`
- Source and generated data: `data-sources/herb_monograph_master.xlsx`, the dated workbook patch, and synchronized `public/data` runtime/search/summary artifacts
- Build/search/audit: runtime workbook builder, search builder, cluster trust audit, safety fill-rate audit, strict CI/deploy wiring
- Routes/rendering: compound/herb formatters, compound route/sitemap/redirect contracts, metadata audit, redirect verifier, content-depth injector, built-export validator
- Tests: resolver, runtime boundary, cluster audit, safety-audit false-positive fixtures
- Documentation: this completion report

## Tests added

Twenty-two semantic regression cases were added:

- 7 resolver/inheritance cases
- 5 runtime boundary cases covering all four profiles and deterministic output
- 5 safety-audit cases covering the four historical false positives plus an invalid empty case
- 2 additional cluster-audit cases beyond the three discovery-phase tests
- 3 build-pipeline parity cases ensuring data, full, and deploy builds all create search output after the final runtime layers

Targeted suites passed 25/25 tests. The full Vitest suite passed 631/631 tests across 102 files. Assertions inspect semantic fields, classification, deterministic normalization, search parity, and rendered/exported content rather than relying only on snapshots.

## Manual production-output verification

All four generated pages were inspected from `out/` with a real Chromium browser at desktop (1440×1000) and mobile (390×844):

- real profile title and self route loaded; neither compound rendered a redirect/not-found boundary
- exactly one visible `Safety & Cautions` section
- evidence label visible in summary and safety context
- profile-specific warnings/contraindications and uncertainty language preserved
- no raw placeholder, generic “well tolerated,” empty card, malformed list, duplicated section, or contradictory local/core copy
- corrected safety-rating and punctuation formatting
- no React hydration error after removal of post-serialization generic injection on these four routes

The built-export validator also checks existence, indexability, self-canonical metadata, evidence labels, generic placeholder leakage, duplicated wording, and post-build HTML divergence for all four pages.

## Validation commands and results

| Command | Result |
| :--- | :--- |
| `npm run audit:cluster-member-trust:strict` | PASS — 4/4 inherited, 4/4 evidence-labelled, 0 structured gaps, 0 runtime defects, 0 rendering defects, 0 false positives, 0 actionable |
| `npm run audit:safety -- --strict` | PASS — 881/881 source safety coverage; cluster-member runtime trust 4/4; no cluster gaps |
| `node scripts/audit-trust-completeness.mjs` | PASS — primary runtime 89/89, 0 remaining, 0 validation errors |
| targeted Vitest suites | PASS — 25/25 |
| `npm run test -- --run` | PASS — 102 files, 631/631 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — zero warnings allowed |
| `npm run data:validate` | PASS |
| `npm run guard:source-of-truth` | PASS |
| `npm run verify:output` | PASS — core routes, redirects, deploy readiness, SEO, structured data, sitemap, robots, affiliate links, Pagefind, cluster export, budgets |
| `npm run build` | PASS — production static export and Pagefind |
| `npm run check:full` | PASS — repository quality, health, evidence, UI, and deployment gates |
| Playwright desktop/mobile inspection | PASS — 4/4 profiles at both viewports |

Repository-wide diagnostics remained nonblocking and unchanged in character: the performance report warns that the 367.89 KB main JS measurement is above its 350 KB warning threshold; evidence/claim audits continue to emit their pre-existing diagnostic warnings while reporting zero blocking cluster-member defects.

## Page-count comparison

The final Next static generation count is **1,187 pages**, unchanged from the discovery baseline. The route manifest increased from 415 to 417 and the final sitemap contains 735 URLs because the two compound cluster-member pages changed from redirect/deprecated surfaces to active self-canonical pages. Next already generated placeholders for those params previously, so restoring them changed their production behavior and index membership without changing the generator's total page count.

## Remaining limitations and medication-interaction deferral

- The workbook declares no cross-entity parent for these records. The deterministic contract therefore inherits from each profile's own workbook-generated core record; creating an inferred herb/compound parent remains out of scope.
- `Entity_Master` has no `side_effects` column. The existing runtime field is populated for these four profiles through a narrow source-backed config rather than a schema migration.
- Evidence labels intentionally retain limited/preparation-specific wording. The implementation does not infer universal safe doses or absence of risk.
- A standalone medication-interaction schema remains deferred. Existing narrative interaction content is preserved in existing supported fields only.

## Final reconciliation

| Discovery category | Initial | Resolved | Remaining |
| :--- | ---: | ---: | :--- |
| Cluster-member profiles | 4 | 4 | 0 incomplete |
| Structured safety gaps | 11 | 11 | 0 |
| Runtime defects | 10 | 10 | 0 |
| Rendering defects | 4 | 4 | 0 |
| Audit false positives | 4 | 4 | 0 |

## Recommended follow-up

The next highest-ROI project is to retire or systematically constrain the remaining legacy detail/summary overlay system across the broader runtime. Extending the shared resolver and built-export parity checks beyond these four records would remove an entire class of generic-copy, visibility, search-flag, and hydration-divergence risk without requiring a schema redesign.
