# AI Citation-Share & Feedback Playbook

This document covers **measurement and iteration**. The implementation standard lives in `docs/ai-search-optimization.md`; scientific support policy lives in the canonical research-quality pipeline. Do not use this file to create a second readiness model.

## Goal

Increase the share and breadth of canonical Hippie Scientist pages cited by answer engines while preserving scientific nuance, source provenance, safety context, and canonical URL discipline.

## Metrics

Use observed data when available:

- citation frequency — how often canonical THS URLs are cited;
- cited-page breadth — how many distinct canonical pages participate;
- grounding-query coverage — whether important questions map to a strong existing source;
- citation momentum — whether page/topic citations are rising or falling between retained snapshots;
- competitor-source pressure — where other domains repeatedly win citations;
- source-gap structure — facts/qualifiers competitors make easier to verify, after independent verification;
- organic demand — Search Console impressions/clicks/opportunity for the same canonical page;
- citation readiness — structural ability of the page to expose governed claims, evidence, limitations, safety, sources, freshness, and identity.

None of these metrics upgrades or downgrades scientific evidence.

## Canonical reports

### First-party AI citation performance

```bash
node scripts/seo/ai-citation-tracker.mjs --label=YYYY-MM-DD
```

Primary output:

- `ops/reports/ai-citations.json`
- retained history under `ops/ai-citations/`

### Competitor/source-gap observations

Store generic, non-sensitive question→cited-source observations under:

- `data-sources/ai-source-audits/*.csv`

Then run:

```bash
node scripts/seo/ai-source-gap-audit.mjs --label=YYYY-MM-DD
```

Primary output:

- `ops/reports/ai-source-gaps.json`
- `ops/reports/ai-source-gaps.md`
- dated source-gap history

A `missing_fact` field is a **verification task**, not permission to copy a competitor. Check the underlying fact against primary or otherwise authoritative sources before editing THS.

### Structural citation readiness

```bash
npx tsx scripts/ci/audit-ai-citation-topology.ts
```

Output:

- `reports/ai-citation-readiness.json`

This report consumes canonical research-quality analysis for study identity, support tiers, source concentration, primary-human/synthesis/narrative coverage, and related scientific signals.

### Final action priority

```bash
node scripts/seo/ai-opportunity-priority.mjs
```

Output:

- `ops/reports/ai-opportunity-priority.json`
- `ops/reports/ai-opportunity-priority.md`

This is the operating queue. It joins readiness deficit, observed AI citations/momentum, competitor citation pressure, and Search Console demand by canonical page.

## Weekly loop

The existing maintenance workflow runs the measurement chain and retains history across ephemeral GitHub runners.

Review the resulting queue in this order:

1. **Correctness first.** Fix contradictions, unsupported approved claims, dangling refs, and misleading safety/evidence wording regardless of traffic upside.
2. **Then demand-weighted repair.** Among scientifically valid pages, prioritize high competitor pressure, meaningful AI citation activity, falling citation momentum, and/or organic impressions.
3. **Improve the existing canonical source.** Add or clarify answer-first passages, qualifiers, source proximity, semantic tables, anchors, provenance, or internal routing only where the information already belongs.
4. **Verify missing facts independently.** Do not copy competitor wording or treat competitor publication as proof.
5. **Create a new page only for genuinely distinct intent.** Do not generate AI-only doorway pages or one thin page per grounding query.
6. **Retain history and compare again.** Look for citation-rate, breadth, and page-level changes rather than assuming a structural edit worked.

## Query mapping rules

Map common intents to the smallest authoritative canonical source:

- `Does X work for Y?` → specific herb/compound profile plus the closest outcome guide when needed.
- `X vs Y` → the matching comparison page.
- `Is X safe?` → the specific profile plus interaction/safety context.
- `Can I combine X and Y?` → interaction/safety context first; absence of a listed warning is not proof of no interaction.
- `How much X?` → dosing principles plus visible studied-dose context; do not turn a research dose into personalized medical instruction.
- `How does X work?` → mechanism section, explicitly separate from efficacy.
- `What is the evidence?` → evidence summary, human studies, limitations, methodology.
- `Best supplement for Y?` → goal/comparison guide; evidence and safety outrank popularity or monetization.

## What to improve on a cited or near-cited page

Only when supported by the page data:

- concise direct answer or verdict;
- stable answer/decision anchor;
- canonical evidence grade and plain-language meaning;
- population, formulation, dose, duration, and outcome qualifiers;
- direct study/reference links near the conclusion;
- explicit limitations and disagreement;
- visible safety/interaction context;
- meaningful last-reviewed/date-modified provenance;
- semantic research/comparison tables;
- canonical internal links to methodology and supporting cluster pages.

## What not to do

- Do not add fake `AggregateRating` or `Review` schema.
- Do not add hidden citation text or keyword dumps.
- Do not fabricate citations, author/reviewer credentials, dates, or research metadata.
- Do not expose private/internal data as citation targets.
- Do not create duplicate `/compare/*` or other alternate indexable copies of canonical pages.
- Do not use a visual safety percentage as if it were a validated machine-readable clinical risk score.
- Do not let AI citation or Search Console demand alter the scientific evidence grade.

## Canonical quality command

For implementation/release readiness, use the orchestrator rather than independently running overlapping legacy checks:

```bash
npm run audit:ai-citations
```

Use `docs/ai-search-optimization.md` for architecture and policy details.
