# AI Search / Answer Engine Optimization Standard

## Objective

Optimize The Hippie Scientist for retrieval, grounding, entity resolution, and citation by AI answer systems without creating doorway pages, hidden keyword text, fake authority, unsupported schema, or a second scientific evidence model.

## Canonical architecture

The site has one scientific-support graph and one public answer architecture:

1. `lib/research-quality-analysis.ts` is authoritative for scientific support topology: canonical studies, study classes, claim/source links, weak support, study dependence, and narrative-vs-primary-human coverage.
2. Canonical HTML pages are the user-facing source and public citation target.
3. JSON-LD entity shards under `/data/ai-entities/` support entity resolution, atomic claims, relationships, provenance, safety context, and review freshness.
4. `lib/ai-citation-readiness.ts` adds retrieval/presentation readiness on top of the canonical research graph. It is not an evidence grader.
5. `public/llms.txt` documents source routing, evidence semantics, entity resolution, citation, safety, and attribution conventions.
6. `robots.txt` and `sitemap.xml` remain the public crawl/discovery controls.
7. Observed AI citations/source gaps and Search Console demand feed one operational priority queue. They do not change scientific evidence grades.

Do not create separate “AI versions” of editorial pages or a competing research-quality taxonomy.

## Page-level answer contract

High-value pages should expose, when supported by source data:

- One unambiguous H1 naming the entity/question.
- A concise answer-first summary or scientific verdict near the top.
- Stable deep-link anchors for important answer/decision sections.
- Evidence grade with plain-language interpretation.
- Human-study count and study types where known.
- Material population, formulation, dose, duration, and outcome qualifiers.
- Safety/interaction context before a recommendation-like conclusion.
- Visible references or source links close enough to claims to verify them.
- Explicit limitations, conflicts, and research gaps.
- Last-reviewed/date-modified signals that distinguish editorial freshness from study publication dates.
- Semantic comparison/research tables where tabular facts are genuinely useful.
- Canonical internal links to methodology, safety, dosing, related entities, and comparisons.

## Claim extraction contract

Atomic claims should preserve subject, predicate, object/outcome, population, formulation, dose when material, duration when material, evidence class, evidence grade, source IDs, review state, and uncertainty.

Do not allow mechanism-only evidence to masquerade as human efficacy. Do not allow a narrative review to substitute for direct primary human evidence where that distinction changes the claim. Claims dominated by one study or one research group must remain identifiable as concentration risk.

## Entity and dataset contract

Entity artifacts should prefer stable identifiers and explicit aliases. Whole herbs, extracts, isolated constituents, salts, formulations, and branded preparations must not be silently collapsed when the distinction changes the evidence.

Each public entity Dataset resolves back to the canonical HTML profile, identifies The Hippie Scientist as the synthesis creator/publisher, exposes the JSON-LD shard as a data download, and points to the public attribution/reuse policy. Do not claim an open license that has not actually been granted.

## Citation-worthiness

Prefer direct, bounded, attributable passages over generic SEO prose. High-value conclusions should make it obvious:

- what the conclusion is;
- what evidence supports it;
- what population/formulation/outcome it applies to;
- what safety or uncertainty materially qualifies it;
- what source or reference lets a reader verify it;
- what would change the conclusion.

A visual display coordinate such as a coarse safety gauge must not be promoted into a machine-readable clinical-looking metric. Expose the governed qualitative interpretation instead.

## Canonical quality commands

The compatibility entrypoint is also the canonical AI-search orchestrator:

```bash
npm run audit:ai-citations
```

It keeps only comparison-page-specific grounding checks locally and delegates to the authoritative modules for:

- answer-engine discovery/extractability/profile semantics;
- canonical research + AI citation-readiness topology;
- claim/evidence consistency;
- entity completeness when built runtime data is available.

Use strict mode only when the advisory backlog has been intentionally triaged:

```bash
node scripts/ci/audit-ai-citation-readiness.mjs --strict
```

Canonical research-quality pass:

```bash
npx tsx scripts/ci/research-quality.ts
```

That pass computes the scientific support graph once and reuses it for research gaps, study-load topology, and AI citation readiness.

## Measurement loop

Weekly maintenance produces complementary evidence about what deserves work next:

- `ops/reports/ai-citations.json` — observed first-party AI citation performance when exports are available.
- `ops/reports/ai-source-gaps.json` — externally observed question→source gaps and competitor citation pressure.
- `reports/ai-citation-readiness.json` — structural citation/readiness queue over the canonical research graph.
- `ops/reports/ai-opportunity-priority.json` — ROI/action queue joining readiness, AI citation demand/momentum, competitor pressure, and Search Console demand.

The priority score is operational triage only. It must never override the scientific evidence model.

## Priority order

1. Correct contradictory evidence/safety claims.
2. Repair unsupported approved claims and dangling source references.
3. Reduce inappropriate single-study dependence and narrative-review dominance.
4. Strengthen claim-to-source provenance and direct human-evidence coverage.
5. Improve answer-first extractability on pages with observed demand.
6. Improve entity identity/provenance, safety context, and freshness signals.
7. Improve semantic tables/anchors/source proximity when they clarify existing information.
8. Expand comparison or goal-query coverage only when it adds genuinely new decision value.
9. Measure citations/referrals and iterate from observed demand rather than generating pages speculatively.

## Anti-patterns

Never optimize for AI search by adding hidden text, keyword dumps, generated doorway pages, fake FAQ questions, fake author credentials, unsupported medical claims, fake ratings/reviews, fabricated citations, invented review dates, duplicate model-name pages, or pseudo-precise machine-readable health scores derived only for visual presentation.
