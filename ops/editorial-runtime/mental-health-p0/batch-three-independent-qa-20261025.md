# Independent Batch 3 QA — 2026-10-25

Reviewed commit: `3509c99b576c49bfc93d29eaa172147fd59793fc`, compared with `origin/main`; 22 changed files including ten distinct manuscripts and the shared research directory/navigation. Read-only repository review; no GitHub, branch or repository mutations performed. This receipt is code/content QA, not publication authorization or deployment verification.

## Result: HOLD for citation-standard repair

1. **Required citation repair:** All ten Batch 3 `keyTakeaways` arrays contain a total of 58 displayed key points with no inline reference IDs. `app/articles/[slug]/page.tsx` renders these entries directly in the public key-point box. `docs/mental-health-content-standard.md` explicitly says every key point must include one or more reference IDs. Add source-specific IDs to each takeaway (with valid page-local references). Cited supporting prose elsewhere does not satisfy the explicit per-key-point requirement. Existing Batch 1/2 precedent does not override the standard. This is a standards finding, not a claim that the key points are medically false.

2. **Minor editorial repair:** Reviewed head contains internal `(Batch 3 draft)` markers at `content/articles/anger-dysregulation-regulation-evidence-review.md:218`, `content/articles/emotional-numbness-anhedonia-blunting-evidence-review.md:207` and `content/articles/shame-versus-guilt-evidence-review.md:210` (the latter may already be locally removed during this review). Remove markers before publication. Root reports the local repair underway; not considered verified on a committed replacement head here.

## Evidence checked

- Ten articles have 6–9 attributable references each, six authored FAQs each, and distinct slugs/intents. Checked all numeric citation references across frontmatter/body for bounds: none outside that page's reference list. All 60 FAQ answers carry inline citations.
- Independently inspected supplied Europe PMC core source records in `/tmp/ths-source-audit.json` against substantive numerical/clinical claims: alexithymia TAS-20 structure and treatment effect; anger arousal, DBT/null aggression, mindfulness and cognitive-bias effects; DDD prevalence and weak treatment evidence; PTSD-related dissociation effect; chronic emptiness cohort/observational context; blunting survey versus medication causality; human versus animal anhedonia results; shame/guilt correlation and compassion review limits; CBASP sample, durations and effects; BPD medication null/low-certainty evidence; splitting psychotherapy versus direct splitting endpoint limits. No blocking clinical or numerical misrepresentation found in these checked claims.
- Fresh PubMed retrieval of PMID 26114394 independently confirmed ADHD/PTSD 28 eligible studies, 22 meta-analyzed, healthy-control RR 3.7, trauma-exposed-control RR 1.6 and nonsignificant psychiatric-control association. Several other fresh PubMed fetches returned only footer content; NICE guideline retrieval returned HTTP 403. Thus most source comparisons rely on supplied core records, not new full-text retrieval. No comprehensive retraction/correction clearance, exhaustive full-text appraisal or human clinician approval is claimed.
- Framing distinguishes narrative reviews from new quantitative syntheses, protocols from results, association from cause, population averages from individual diagnosis, BPD from abusive behavior, anger from aggression, and historical trial medication from a current recommendation. Medication withdrawal cautions and urgent-help language are present.
- Shared registry contains 30 article routes, including all ten new reviews. Search/filter code has a visible label, pressed-state buttons, polite result count and clear-filter empty state. Latest source preserves original Mental Health label and three direct limerence/BPD research links while adding a directory anchor and mobile Mental Health entry. No duplicate registry href found by passing directory regression.

## Independently executed validation

Commands run with local `node_modules/.bin/vitest`:

- `run app/__tests__/mental-health-p0-batch-three.test.ts app/__tests__/mental-health-research-directory.test.ts --reporter=dot`: 2 suites, 8 tests passed.
- `run components/__tests__/MentalHealthResearchDirectory.test.tsx app/__tests__/limerence-bpd-research-series.test.ts --reporter=dot`: 2 suites, 6 tests passed; interaction test exercises case-insensitive search, topic intersection, empty results, clear filters and all 30 restored links.

An initial first command also included a nonexistent component-test path; the component test was subsequently run at its actual path above. No production build rerun by this reviewer; root's prior build evidence remains separately owned. Existing `out/` predates latest navigation restoration, so it cannot prove exact-head final navigation. No screenshots or real-browser mobile/desktop/light/dark visual PASS claimed: browser executable unavailable locally. Hosted CI, protected gates, scientific/human approval, exact committed repair verification, merge and Cloudflare production receipt remain root release responsibilities. No merge or deployment occurred as part of this review.

## Source-specific takeaway citation mapping for repair

Each array follows the current frontmatter takeaway order, using existing page-local reference numbers. These map to the source family supporting the claim and its cautious inference. Safety/accountability statements and cautions against individual diagnosis are editorial/clinical implications rather than independently quantified trial endpoints; attaching a reference must not present them as experimentally demonstrated effects. Review the exact wording before applying.

```json
{
  "alexithymia-emotional-awareness-evidence-review": ["4,5,6", "4,5,6", "3", "1", "4,5,6,7", "1,2,5"],
  "anger-dysregulation-regulation-evidence-review": ["1,2,4,8", "1", "2", "3,4", "5,6", "2,4,8"],
  "chronic-emptiness-bpd-depression-evidence-review": ["1,2,3", "1", "3", "4", "7,8", "1,3,4"],
  "dissociation-depersonalization-derealization-evidence-review": ["5", "1,4,5", "1", "2", "3", "5,6"],
  "emotional-numbness-anhedonia-blunting-evidence-review": ["1,2,6", "1,4,6", "2", "3,8", "5", "1,4"],
  "shame-versus-guilt-evidence-review": ["1,6", "1", "3,4,5", "2", "6,8", "7,9"],
  "splitting-dichotomous-thinking-evidence-review": ["1,2,4", "1", "2", "1,2,4", "3,4,5,6,8", "1,4"],
  "bipolar-ii-versus-bpd-evidence-review": ["1,3", "2,4", "2", "1,2,3", "1,3,4,5,6"],
  "adhd-versus-trauma-ptsd-evidence-review": ["1,2,4,5", "4,5", "1", "1,2,3,4", "6"],
  "persistent-depressive-disorder-dysthymia-evidence-review": ["1,2,6", "1,5", "1", "2", "4,6", "5"]
}
```

## Working-tree repair verification — 2026-10-25

Independently reread the repaired working tree before root's commit. All 58 takeaways across the ten manuscripts now end with exactly the page-local reference-ID mapping supplied above; every ID is within that page's reference count. Original draft/staging markers are absent. Inspected the updated Batch 3 regression: it now requires numeric citations on each takeaway, bounds-checks each cited ID, and rejects `(Batch N draft)` and `(staged for this batch)` in article prose. Re-ran `node_modules/.bin/vitest run app/__tests__/mental-health-p0-batch-three.test.ts --reporter=dot`: 1 suite, 5 tests passed.

**The citation-standard/editorial HOLD identified in this receipt is resolved in the reviewed working tree. Qualified code/content QA PASS for those repairs.** This is not an assertion that a committed replacement head, final build, hosted CI, clinical approval or production deployment has passed. All prior source-access, full-text/retraction-review, visual/browser and exact-deployment limitations remain in force. No repository or GitHub mutations were made by this reviewer.

## Current release policy clarification

The owner's October 23 policy does not require a separate mandatory human-positive signoff. Existing source/scientific, safety, security, exact-head CI/build, review-resolution and serialized protected-controller gates remain required. No production release is claimed by this receipt.
