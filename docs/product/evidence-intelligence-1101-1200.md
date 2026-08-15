# Evidence Intelligence 1101–1200

This batch extends the claim-centric Evidence Engine with outcome/condition hierarchy, outcome-specific evidence comparison, marketing-vs-evidence auditing, label transparency analysis, supplement-stack screening, medication-class interaction exploration, and mechanism visualization primitives.

## 1101–1105 — cognition outcome expansion

`lib/evidence/outcomes.ts`

- separates attention, processing speed, executive function, working memory, memory, subjective cognition, and generic cognition;
- keeps objective and subjective cognition distinguishable;
- preserves the existing instrument-aware synthesis behavior.

## 1106–1120 — hierarchical condition ontology

`lib/evidence/condition-ontology.ts`

- defines sleep, stress, anxiety, focus, mood, metabolic, exercise, and cognition roots;
- adds child outcomes/conditions, aliases, breadcrumbs, content-cluster metadata, and deterministic internal-link targets;
- provides reusable SEO/content architecture metadata without hard-coding page templates.

## 1121–1128 — outcome-specific evidence matrix

`lib/evidence/evidence-matrix.ts`

- groups evidence by outcome;
- distinguishes most studied from best supported;
- surfaces strong support, weak/no-benefit evidence, and popular-but-weak evidence;
- uses independent trials rather than publication count as the replication concept.

## 1129–1137 — marketing-vs-evidence audit

`lib/evidence/evidence-matrix.ts`

- compares marketing intensity with evidence grade/direction;
- flags overmarketed, underrecognized, aligned, or unclear ingredient/outcome pairs;
- emits visualization-ready and quarterly snapshot data for editorial/journalist assets.

The module creates deterministic data primitives. It does not scrape commercial marketing claims or publish claims automatically.

## 1138–1160 — Supplement Label Decoder

`lib/safety/supplement-label-decoder.ts`

- parses ingredient disclosure quality inputs;
- flags proprietary blends, missing amounts, ambiguous forms/standardization, extract-ratio-only disclosure, duplicate ingredients, megadose screening signals, unsupported testing language, and strong therapeutic marketing language;
- calculates a Product Label Quality score focused on transparency, specificity, and testing disclosure;
- compares labels without converting the label score into an efficacy or safety ranking.

## 1161–1175 — Supplement Stack Checker

`lib/safety/supplement-stack-checker.ts`

- detects duplicate ingredient exposure;
- separates known/probable findings from theoretical overlap;
- surfaces cumulative stimulant, sedative, blood-pressure-lowering, glucose-lowering, serotonergic, and coagulation-related screening signals;
- marks its processing contract as local-only and avoids individualized dosing or treatment recommendations.

## 1176–1191 — Medication Class Interaction Explorer

`lib/safety/medication-class-interactions.ts`

- defines reusable medication classes;
- models established, probable, theoretical, and insufficient interaction evidence separately;
- validates evidence/severity combinations so theoretical mechanisms cannot silently become major established interactions;
- provides class-level educational output rather than individualized medication advice.

The module is a normalized knowledge model. It does not claim an exhaustive live interaction database or replace pharmacist/clinician review.

## 1192–1200 — Mechanism Explorer

`lib/evidence/mechanism-explorer.ts`

- separates human clinical outcomes, human biomarkers/mechanistic findings, and preclinical evidence;
- provides explicit `human-outcomes`, `mechanistic-context`, and `all` views;
- prevents animal/in-vitro/computational mechanisms from supporting efficacy claims;
- emits pathway graph primitives with evidence-tier-aware edges.

## Regression coverage

- `lib/evidence/__tests__/ontology-expansion.test.ts`
- `lib/evidence/__tests__/evidence-matrix.test.ts`
- `lib/safety/__tests__/decision-tools.test.ts`

These tests protect the core semantics: most studied is not automatically best supported, subjective cognition is distinct from objective testing, theoretical interaction signals remain theoretical, and mechanisms do not become human efficacy claims by implication.

## Integration boundary

This batch lands the reusable domain models, guardrails, scoring primitives, and regression tests. It intentionally does **not** fabricate external APIs, live product-label OCR, medication databases, or marketing scrapers. UI pages can consume these modules as structured data becomes available.
