# RC/NPS consolidated closeout — 2026-10-05

## Scope and ownership

Existing issue #6258 / PR #6257 owns this closeout. The implementation incorporates the existing monograph batch plus #6249 / PR #6252 (profile withdrawal/recovery support) and #6253 / PR #6254 (five class recovery guides). The original expansion #6218 / PR #6217 and designer-benzodiazepine batch #6242 already merged and are not pending work.

The current inventory contains **92 source articles** in the two RC/NPS categories: the prior 87 plus five recovery guides. All **45 unchecked candidate names** have explicit dispositions in [the candidate record](rc-nps-candidate-dispositions-2026-10-05.json). Withheld standalone routes are resolved editorial decisions. They are not a claim that no literature exists and do not authorize a new implementation wave.

## Changes and evidence boundaries

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
- `node scripts/ci/validate-article-quality.mjs`: PASS after the recovery citations and content repairs; rerun on final source required.
- `node --test scripts/lib/__tests__/article-reference-identity.test.mjs`: 2/2 PASS; final focused content regression results are recorded with the PR.
- `node scripts/audit/rc-nps-library.mjs docs/content/rc-nps-library-audit-2026-10-05.json`: 92 articles; 0 broken article links. Related-slug findings are repaired and the report is regenerated.
- `node scripts/audit/rc-nps-reference-snapshot.mjs <retrieved MED/core snapshot> docs/content/rc-nps-reference-audit-2026-10-05.json`: 703 reference occurrences / 473 distinct PMIDs / 0 identity findings. The external metadata snapshot was retrieved during this run; full abstracts are not committed.
- Production build, responsive/light/dark visual verification and exact-head hosted release gates: pending at authoring time; recorded in the PR/check receipts before merge. Build artifacts and unrelated generator churn are excluded from source commits.

Merge/deployment receipt and external impact are separate. No traffic, ranking, conversion, revenue or observed treatment outcome is inferred from source changes or green CI.
