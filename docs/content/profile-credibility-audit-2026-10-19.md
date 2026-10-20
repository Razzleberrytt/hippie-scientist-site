# Public profile credibility audit — #6932

Status: implementation in review in PR #6934; local production export passed, exact-head hosted build and protected merge/deployment evidence pending. Owner instruction: fix the supplied homepage/herb-index/Ashwagandha/Brassica audit and merge. Admission is tracked separately in PR #6933. No clinical signoff or search/business outcome is claimed.

## Existing architecture and repair boundary

Reuse the workbook/runtime pipeline, `extractCitationsFromRecord` publication inventory, existing grade backing, runtime visibility ceiling, final invariant enforcement, shared metadata builder, static media pipeline and international SEO registry. Preserve source grades, citation context records, stricter governance holds, author attribution and stable URLs. This repair does not create a parallel science dataset or invent reviewer credentials. The independent reviewer inspected these boundaries and required final-only publication changes, reviewed-edge filtering and late social-card generation.

## Audit dispositions

| Finding | Implementation / verification boundary |
|---|---|
| Conflicting counts | Profile byline, evidence lens and study table use the same distinct citation inventory; generated counts use publication records rather than claims plus metadata rows. Distinguish source publications, human evidence publications and primary trials. |
| Consistency and bias | Study design no longer proves low bias or consistent outcomes. Absent assessments remain unassessed. A public Grade A is withheld when its required bias/consistency assessment is absent; the authored grade remains in `evidence_grade_source`. |
| Unsupported A/B and Bacopa | Existing zero-human backing rule retained. Explicit conflict between an authored strong grade and a limited/mixed evidence description withholds the settled public grade. Index cards use the authored summary rather than inventing a promotional synopsis from mechanisms and grade. |
| Participant total | Review N is excluded from the primary-trial metric. The public table suppresses a unique participant aggregate entirely without independence reconciliation; individual source N remains visible. |
| Large Ashwagandha effects | PMID [41644067](https://pubmed.ncbi.nlm.nih.gov/41644067/) reports exactly the cited SMDs and confidence intervals. They are not a demonstrated extraction error. Add an interpretation caveat; full-text statistical appraisal remains unverified. |
| Zero-human profiles | Final citation-based zero count restricts indexing, featuring and monetization while retaining renderable URLs. Final-only status mutation follows citation export, quarantine, PubMed metadata and overrides; preserve stricter BLOCKED/NEEDS_REVIEW states. |
| Thin Brassica presentation | No best-for or dose presentation inferred without recorded human evidence. Metadata promises research gaps and safety rather than benefits/dosage. Existing specific medication, allergy and thyroid cautions remain. |
| Safety false positives | Summary and description prose cannot generate safety classifications. Theoretical keyword-pair edges do not become displayed detected interactions or partner counts, including mixed-certainty input. |
| Contraindication coverage | Surface pregnancy/breastfeeding and liver cautions when they occur in the source safety notes, alongside the structured avoid fields. |
| Review dates / byline | Remove templated August review date and unsupported independent-review attestation. Scope the Ashwagandha claim review date to that claim. Link the visible reviewer policy; no credentials are fabricated. |
| Placeholders / snippets | Remove generated-profile credit wording and Efct typo. Use complete summaries, avoid hard truncation, retain display-layer token formatting and run a built-output leak gate. |
| Inventory mismatch | Current main already shares the exact `loadPublishedHerbs` selector between homepage and herb directory. Retain it and verify built counts after the new policy. |
| Broken or duplicate links | Index absence does not establish a 404. Preserve existing route aliases/redirects and href-deduplication; verify actual exported link targets in the output audit. |
| Empty study fields | Hide wholly empty N/dose/duration/population/outcome columns; preserve source/design/result context. |
| Names and metadata | One common-name policy for visible profile/directory names and metadata, separate botanical-name formatting, full homepage description, no emitted meta keywords. |
| Social previews | Deterministic route-specific 1200×630 PNG cards generated after finalized data, before static export. Verify URL, file existence, PNG signature and dimensions. No extensionless social-card URL. |
| Newsletter / internal language | Use coherent research-notes/safety-resource capture copy. Remove public proof-of-concept and internal policy wording. Ashwagandha verdict becomes situation-dependent. |
| Canonicals / locales | Preserve existing canonical identity and reciprocal translation registry. Species/genus and turmeric/curcumin identities are not consolidated solely from similar names. Do not advertise untranslated scientific profiles. Focused international SEO tests pass; built output remains required. |
| Performance / accessibility | Source/theme checks are not CrUX or whole-site accessibility certification. Responsive light/dark browser and exact-head release evidence remain required; field Core Web Vitals remain unmeasured here. |

## Publication inventory and guardrails

Pre-invariant governed output was 223 herbs and 111 compounds (334). The zero-human restriction initially yielded 98 herbs and 64 compounds (162). Exact policy dispositions are generated in `ops/reports/evidence-grade-migration.json` under `publicationPolicy`, including identity, prior/final status, human publication count and reason. The observed cohort contains 640 explicit zero-human records, of which 169 were previously PUBLISH; all newly policy-denied records have zero recorded human publications. Other existing holds account for the remaining pre-invariant difference.

The final production invariant stage remains authoritative for claim-specific citation defects. It must not rehydrate citations or re-normalize authored scientific fields while refreshing derived output. The chosen release floors are 90 herbs, 55 compounds and 150 total, with a synthetic negative regression demonstrating that further unexpected discovery loss still blocks deployment. The final invariant stage retained nine claim-specific citation holds, yielding 95 herbs and 58 compounds (153). Its findings concern garlic, hericium-erinaceus, rhodiola, caffeine, caffeine-l-theanine, magnesium, melatonin, omega-3 and probiotics. No claim-specific gate is relaxed to keep these in the index. Built-output counts may separately exclude canonical aliases; homepage and directory must agree on their shared selector.

## Validation evidence

- Authenticated admission validation: PASS, D #6932, score 75.0, WIP 3/3.
- Original negative regressions reproduced review N=958 and safety badges inferred from efficacy/mechanism prose before fixes; both passed afterward.
- Focused evidence/safety/UI/localization tests: 88 tests across 10 files passed, including Grade A assessment regression. Seven credibility regressions passed again after discovery eligibility changes.
- Native production inventory negative regression: passed.
- `npm run check:fast`: passed before the final Grade A assessment/publication-report adjustment; final source checks required.
- Earlier production builds stopped on the old inventory floor and an invalid normalization call during preserve-governed-state refresh. Both were repaired; no earlier build is claimed as successful.
- Local production export: PASS (1704 HTML pages; structured-data and public-language checks passed). Full postbuild output groups passed after final sitemap generation. The earlier concurrent output invocation observed a transient sitemap before rewrite; it is not a release result. Final small source changes require the exact-head hosted export, including the compact pregnancy/liver warning regression and editorial compound social-card metadata.
- Browser: four audited routes rendered at desktop/light and mobile/dark; Indian mustard is noindex with no mobile horizontal overflow. Captured screenshots exposed compact contraindication truncation, now removed and guarded by the output validator. Local static server returns a preexisting 404 for /api/analytics-eligibility; this is not field performance or whole-site accessibility proof.
- Remaining proof: exact-head hosted export and output checks, final visual recheck, protected controller merge and production receipt.
