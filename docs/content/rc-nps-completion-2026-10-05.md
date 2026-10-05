# RC/NPS consolidated closeout — 2026-10-05

## Scope and ownership

Existing issue #6258 / PR #6257 owns this closeout. The implementation incorporates the existing monograph batch plus #6249 / PR #6252 (profile withdrawal/recovery support) and #6253 / PR #6254 (five class recovery guides). The original expansion #6218 / PR #6217 and designer-benzodiazepine batch #6242 already merged and are not pending work.

The current inventory contains **92 source articles** in the two RC/NPS categories: the prior 87 plus five recovery guides. All **45 unchecked candidate names** have explicit dispositions in [the candidate record](rc-nps-candidate-dispositions-2026-10-05.json). Withheld standalone routes are resolved editorial decisions. They are not a claim that no literature exists and do not authorize a new implementation wave.

## Changes and evidence boundaries

- Use supported conservative evidence badges and shorter, readable titles for the five recovery guides; preserve detailed evidence limits in the body.
- Complete the ten existing monograph upgrades and compound-level recovery navigation; add the five class recovery guides with direct, section-level study links and exact numerical-claim citations.
- Add the current SAMHSA National Helpline and FindTreatment.gov referral path across the 92-route inventory. Treatment referral is distinguished from emergency care. No consumer dose, potency conversion, sourcing, synthesis, test evasion, or DIY taper instructions are added.
- Reconcile PMID identity, reference titles/authors/years and DOI pairs against a retrieved Europe PMC MED/core metadata snapshot. Replace the unrelated MGM-16 review PMID with 32930582; include its original-study funding correction (30886001). Bibliographic identity is not claim-level scientific approval.
- Correct clobromazolam's stale current-WHO-review claim against the September 3, 2026 UNODC agenda update. The earlier FDA notice is historical. Correct 4-FA's U.S. effective date to February 17, 2026 and distinguish eutylone's separate listing from its pre-existing positional-isomer control.
- Integrate supported candidate findings into canonical nitazene, dissociative, cathinone, NBOH, cannabinoid and qualone family pages. Keep mixed forensic detections separate from cause of death, animal/in-vitro findings separate from human outcomes, and exact-compound names separate from fluorinated analogues and branded products.
- Repair six articles' related-slug metadata to use existing canonical articles. Preserve all established routes.
- Narrow the reference dummy-label guard so a real study title ending “as examples” is accepted while actual placeholder reference labels still fail. Regression coverage protects both outcomes.

## Named unresolved evidence findings

These are retained uncertainty boundaries, not fabricated completion evidence:

1. **4F-MPH jurisdictional status:** no complete current national/state/analogue determination was established. The page explicitly says so and links a primary lookup. Absence of a short name in one schedule is not a legal conclusion.
2. **Sparse compounds:** controlled human PK, isolated toxic thresholds, dependence incidence and withdrawal calendars remain unavailable or insufficiently established in many monographs. Related-drug data remain labelled contextual rather than direct evidence.
3. **Candidate identity and product contents:** MDMB-PINACA versus 5F-MDMB-PINACA, alpha-PiHpP/iso-PV8, noisy DPT/3C-P short-name retrieval and unconfirmed Homiez/KLAZ contents remain withheld from standalone promotion. See each individual disposition, including primary records where applicable.
4. **Legal scope:** dated jurisdiction-specific statements do not establish global legality. A historical notice is not a fresh current-control determination.
5. **Source screening scope:** the reference audit checks metadata title/DOI identity for indexed PMID references. It does not certify every numerical/body claim, every non-PMID source, full-text eligibility, absence of all corrections/retractions, or independent editorial/scientific approval.
6. **Structural audit scope:** heading signals are review leads. “Missing uncertainty” commonly reflects an `Evidence ledger` or body-level “not established” statement; family routers, product-identity pages and recovery guides have different reader jobs from single-molecule monographs. Their missing monograph headings remain visible in the machine report rather than being padded or relabelled as automatic scientific PASS.

## Validation receipts

- `npm run check:fast`: PASS on the consolidated source state before the final related-slug/reference-author formatting repair. Typecheck and the fast citation, scientific-name and theme-contrast gates passed.
- `node scripts/ci/validate-article-quality.mjs`: PASS on final source after badge/title normalization.
- `npx vitest run --project scripts-node scripts/lib/__tests__/article-reference-identity.test.mjs scripts/lib/__tests__/rc-nps-closeout.test.mjs`: 6/6 PASS. The regressions use the repository's scripts-node runner.
- `npx vitest run --project app-dom lib/__tests__/kratom-compound-cluster.test.ts`: 16/16 PASS, including six-compound reciprocal schema/source provenance. Related-slug repair preserves all existing valid article and registered relationship targets rather than replacing the cluster.
- `node scripts/audit/rc-nps-library.mjs docs/content/rc-nps-library-audit-2026-10-05.json`: 92 articles; 0 broken article links; 0 unresolved related slugs. Twelve related-slug findings across six articles were repaired.
- `node scripts/audit/rc-nps-reference-snapshot.mjs <retrieved MED/core snapshot> docs/content/rc-nps-reference-audit-2026-10-05.json`: 703 reference occurrences / 473 distinct PMIDs / 0 identity findings. The external metadata snapshot was retrieved during this run; full abstracts are not committed.
- Local `npm run build`: PASS, all 37 steps in 1003.50 seconds; 1,701 static pages generated. This local export preceded final referral/badge/title metadata repairs; exact-head hosted export proof is authoritative for final source. Build artifacts and unrelated generator churn are excluded from source commits.
- Local sitemap observation: 1,089 URLs; herbs 208 / compounds 99 / articles 257 / guides 180. The validation log separately reports governed indexability of herbs 215 / compounds 102. These differing artifact counts are retained as observed, not reconciled to the more favorable number.
- Exact-head hosted release and visual receipts: see the verified receipt below.

Merge/deployment receipt and external impact are separate. No traffic, ranking, conversion, revenue or observed treatment outcome is inferred from source changes or green CI.

## Verified release receipt

- Original owning PR: https://github.com/Razzleberrytt/hippie-scientist-site/pull/6257
- Final source head: `17ea07e9ca2ecd45bbaf60fdd125c71fcfb6f055`
- Merge commit: `6151f17759b09bd0b9a73a605b58b70b813e8dda`
- Merged at: 2026-10-05T12:37:53Z
- CI run [37308582347](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37308582347): final source `17ea07e9ca2ecd45bbaf60fdd125c71fcfb6f055`; Validation/tests/data and Production build/output/SEO both PASS. Full Vitest receipt: **742 suites / 3,837 tests passed**. Focused RC/NPS and existing compound-cluster suites: **22/22 PASS**.
- Exact-head governed consumers: [Build Check 37309570994](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37309570994), [Lighthouse 37309574584](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37309574584), [Production Content Lint 37309577997](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37309577997), and [Content Invariants 37309581873](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/37309581873): **PASS**. These dispatched consumers were queried by exact source SHA; the skipped initial PR jobs are not their proof.
- Project-control reconciliation, Build Quality, Atomic, Site Health and Content Claim Drift: **PASS** on the same source. The clobromazolam regulatory review thread is resolved.
- Downloaded governed export receipt: source `17ea07e9ca2ecd45bbaf60fdd125c71fcfb6f055`, base `209b461135ca19eaa5f7e765f1e1180ed6ad461b`, producer `37308582347`; **8,699 files / 1,690 HTML files**; output hash `c3666724dfabb89b7b2b72e0434a00b59d3042f424300c57d6ebbf683b87c9cf`.
- Playwright verification against that downloaded export: **28/28 observations across seven routes**, light/dark themes and **390×844 / 1440×1000** viewports; **0 horizontal-overflow findings / 0 browser runtime errors**; all seven routes expose PMID source links, the current helpline link and the emergency-care boundary. Five routes are the new recovery guides; the others are clobromazolam and MGM-16. Eight screenshots were retained; four representative mobile/desktop/light/dark captures were visually inspected. This is a sampled Chromium proof, not a 92-page or cross-browser certification.
- The initial browser check exposed oversized prose-as-evidence badges and long titles; the five recovery guides now use supported conservative labels and concise titles while preserving detailed scientific limitations in their body text.
- #6258, #6249 and #6253 are CLOSED. #6252 and #6254 are CLOSED as superseded, with their source work incorporated into merged #6257; they are not represented as independently merged PRs.
- Production deployment is a separate receipt and was **not confirmed at the time of this merge record**. No deployment success, traffic, ranking, revenue, treatment outcome or measured resource savings is inferred from these release checks.
