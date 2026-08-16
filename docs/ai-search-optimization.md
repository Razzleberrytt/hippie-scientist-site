# AI Search / Answer Engine Optimization Standard

## Objective

Optimize The Hippie Scientist for retrieval, grounding, entity resolution, and citation by AI answer systems without creating doorway pages, hidden keyword text, fake authority, or schema that is not supported by visible content.

## Canonical architecture

The site uses one public answer surface and one supporting machine-readable surface:

1. Canonical HTML pages are the user-facing source and citation target.
2. JSON-LD entity shards under `/data/ai-entities/` support entity resolution, atomic claims, relationships, provenance, safety, and freshness.
3. `llms.txt` explains retrieval, citation, evidence, entity, and temporal semantics.
4. `robots.txt` keeps canonical public pages and AI entity artifacts crawlable while excluding internal/runtime surfaces.
5. `sitemap.xml` remains the canonical discovery inventory.

Do not create separate “AI versions” of editorial pages.

## Page-level answer contract

High-value pages should expose, when supported by source data:

- One unambiguous H1 naming the entity/question.
- A concise answer-first summary near the top.
- Evidence grade with plain-language interpretation.
- Human-study count and study types where known.
- Material population, formulation, dose, duration, and outcome qualifiers.
- Safety/interaction context before a recommendation-like conclusion.
- Visible references close enough to claims to verify them.
- Explicit limitations, conflicts, and research gaps.
- Last-reviewed/date-modified signals that distinguish editorial freshness from study publication dates.
- Canonical internal links to methodology, safety, dosing, related entities, and comparisons.

## Claim extraction contract

Atomic claims should answer: subject, predicate, object/outcome, population, formulation, dose when material, duration when material, evidence class, evidence grade, source IDs, review state, and uncertainty.

Do not allow mechanism-only evidence to masquerade as human efficacy. Do not allow a narrative review to become the sole evidence for a strong clinical claim when primary human evidence should exist. Flag claims dominated by one study or one research group.

## Entity resolution contract

Entity artifacts should prefer stable identifiers and explicit aliases. Whole herbs, extracts, isolated constituents, salts, formulations, and branded preparations must not be silently collapsed when the distinction changes the evidence.

## Citation-worthiness

AI systems are more likely to reuse passages that are direct, bounded, attributable, and easy to verify. Prefer short factual sections with visible qualifiers over generic SEO prose. Every high-value conclusion should make it obvious what evidence supports it and what would change the conclusion.

## Anti-patterns

Never optimize for AI search by adding hidden text, keyword dumps, generated doorway pages, fake FAQ questions, fake author credentials, unsupported medical claims, fake ratings/reviews, fabricated citations, or duplicate pages targeting model names such as “ChatGPT” or “Perplexity.”

## Release audit

Run:

```bash
node scripts/ci/audit-ai-answer-engine-readiness.mjs
node scripts/ci/audit-ai-citation-readiness.mjs
node scripts/ci/audit-ai-entity-completeness.mjs
```

Use `--strict` on the answer-engine audit only after advisory warnings have been intentionally triaged. The entity completeness audit can use its explicit average-score threshold when the dataset is mature enough to gate releases.

## Priority order

1. Correct contradictory evidence/safety claims.
2. Strengthen claim-to-source provenance.
3. Improve answer-first extractability on pages already earning impressions.
4. Improve entity completeness and stable identifiers.
5. Improve freshness and conflict signals.
6. Expand comparison and goal-query coverage only when it adds genuinely new decision value.
7. Measure citations/referrals and iterate from observed query demand rather than generating pages speculatively.
