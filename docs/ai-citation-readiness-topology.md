# AI Citation Readiness Topology

## Purpose

Use one profile-level prioritization layer to decide which herb and compound pages need research/editorial repair first. This topology does not replace evidence grading, claim integrity, evidence concentration, freshness, or safety audits. It consumes the same public entity artifacts and turns their signals into a remediation order.

## Canonical score

`audit-ai-citation-topology.mjs` scores each machine-readable profile from 0–100 using:

- claim-to-source citation completeness: 25%
- primary-human/systematic-review coverage among human-relevant sources: 20%
- independence from a single dominating source: 15%
- source depth: 10%
- explicit freshness signal: 10%
- safety/interaction signal: 10%
- answer/extractability signal: 10%
- contradictory extractable claims: −35 point penalty

The score is a triage score, not a scientific evidence grade and not a public efficacy rating.

## Interpretation

- 85–100: citation-ready structure; still subject to substantive editorial review.
- 70–84: usable but has identifiable citation/research gaps.
- 50–69: remediation priority.
- 0–49: high-priority research-quality repair before expanding or promoting the page.

## Remediation order

For low-scoring profiles, fix gaps in this order:

1. Contradictory claims or conflicting evidence labels.
2. Claims with no source link.
3. Strong claims overly dependent on one study/source.
4. Narrative-review dominance where primary human evidence should exist.
5. Missing or weak primary-human/systematic-review coverage.
6. Missing safety context.
7. Missing freshness/review signals.
8. Weak answer-first extractability.

Never improve the score by fabricating citations, duplicating sources, relabeling narrative reviews as primary studies, or adding generic safety/freshness prose that is not supported by the underlying record.

## Output

Run:

```bash
node scripts/ci/audit-ai-citation-topology.mjs
```

The audit writes `reports/ai-citation-readiness.json`, sorted from weakest to strongest profile. This becomes the canonical AI citation-remediation queue.

Use `--strict` only when the entity artifacts have been generated and the existing backlog has been intentionally triaged. Strict mode fails on contradictory profiles or any profile scoring below 50.

## Relationship to existing audits

The specialized audits remain diagnostic tools. This topology is the prioritization layer. Do not create another overlapping score or remediation queue unless it measures a genuinely different outcome.
