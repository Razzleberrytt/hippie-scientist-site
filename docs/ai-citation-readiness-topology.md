# AI Citation Readiness Topology

## Purpose

Use one profile-level prioritization layer to decide which herb and compound pages need research/editorial repair first. The topology does not maintain its own scientific evidence model. Research-quality signals come from `lib/research-quality-analysis.ts`; public AI entity artifacts contribute only presentation/retrieval signals such as extractability, freshness, safety context, and semantic contradictions visible to answer engines.

## Canonical score

`scripts/ci/audit-ai-citation-topology.ts` scores each machine-readable profile from 0–100 using:

- canonical claim-to-source citation completeness: 25%
- canonical primary-human/systematic-review coverage: 20%
- canonical independence from a single dominating study: 15%
- canonical study depth: 10%
- explicit freshness signal in the public entity surface: 10%
- safety/interaction signal in the public entity surface: 10%
- answer/extractability signal in the public entity surface: 10%
- contradictory extractable claims: −35 point penalty

The score is a triage score, not a scientific evidence grade and not a public efficacy rating.

## Canonical research inputs

The topology consumes these fields directly from the shared research-quality analyzer instead of recomputing them from JSON-LD:

- canonical study identities and counts
- primary-human, synthesis, and narrative-review counts
- weak structured claims
- unsupported approved claims
- dangling source references
- single-study approved claims
- dominant-study supported-claim share
- effective study count
- single-study over-dependence
- narrative-vs-primary-human dominance
- no-primary-human coverage

This prevents AI SEO scoring from silently disagreeing with release research-quality policy.

## Interpretation

- 85–100: citation-ready structure; still subject to substantive editorial review.
- 70–84: usable but has identifiable citation/research gaps.
- 50–69: remediation priority.
- 0–49: high-priority research-quality repair before expanding or promoting the page.

## Remediation order

For low-scoring profiles, fix gaps in this order:

1. Contradictory claims or conflicting evidence labels.
2. Unsupported approved claims or dangling source references.
3. Weak structured claims and single-study dependence.
4. Narrative-review dominance where primary human evidence should exist.
5. Missing or weak primary-human/systematic-review coverage.
6. Poor study-design metadata coverage.
7. Missing safety context.
8. Missing freshness/review signals.
9. Weak answer-first extractability.

Never improve the score by fabricating citations, duplicating sources, relabeling narrative reviews as primary studies, or adding generic safety/freshness prose that is not supported by the underlying record.

## Output

Run:

```bash
npx tsx scripts/ci/audit-ai-citation-topology.ts
```

The audit writes `reports/ai-citation-readiness.json`, sorted from weakest to strongest profile. This is the canonical AI citation-remediation queue.

Use `--strict` only when the entity artifacts have been generated and the existing backlog has been intentionally triaged. Strict mode fails on contradictory profiles or any profile scoring below 50.

## Relationship to existing audits

`analyzeResearchQuality()` is authoritative for scientific-support topology. Specialized audits remain diagnostics. The AI topology adds retrieval/presentation readiness on top of that canonical graph; it must not create a second research-quality taxonomy, study classifier, concentration model, or remediation queue.
