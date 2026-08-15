# Evidence Intelligence Contract — Backlog 1001–1100

Status: implemented foundation
Scope boundary: backlog items 1001 through 1100 only

This contract turns the existing claim-centric Evidence Engine specification into deterministic runtime primitives. It intentionally extends the canonical evidence architecture rather than creating a parallel grading system.

## 1001–1024 — freshness, external change, and evidence history

Implementation: `lib/evidence/claim-freshness.ts`

- Every claim can receive a 0–100 freshness score and review priority.
- Research velocity changes the default age threshold: fast = 5 years, moderate = 7, slow = 10.
- Older evidence is not automatically invalid. Records explicitly marked as still clinically relevant remain usable and receive contextual protection from age-only downgrading.
- Newer systematic reviews/meta-analyses can be identified as superseding older evidence with overlapping ingredient/outcome scope.
- Updated reviews are sorted ahead of older reviews for synthesis/presentation.
- FDA, NCCIH, EFSA, and Health Canada are represented as governed external watch authorities.
- Material safety/regulatory changes and contradictory systematic reviews route to high/urgent editorial review.
- External updates can never authorize an automatic rewrite of a medical conclusion; human review is required.
- Evidence versions preserve historical grades, grading version, study set, triggering studies, prior-version pointer, and editorial reason.
- Major grade changes can emit an `Evidence changed` state and become eligible for newsletter, press, and social distribution.
- Annual evidence history is derived from immutable snapshots rather than overwriting old grades.

User-facing reusable history UI: `components/evidence/EvidenceHistory.tsx`.

### External monitor boundary

The deterministic core consumes normalized `ExternalEvidenceUpdate` events. Network-specific collectors (RSS/API/page-change jobs) should stay outside the scoring layer and feed this contract. This avoids allowing an upstream page-format change to silently alter published medical conclusions.

## 1025–1052 — claim-strength and citation discipline

Implementation: `lib/evidence/claim-language.ts`

Canonical claim-strength states:

- `may-improve`
- `probably-improves`
- `shown-to-improve`
- `insufficient-evidence`
- `no-meaningful-effect`
- `conflicting-evidence`

Evidence grades cap the strongest wording a template may use. The linter also detects:

- unjustified `proven`, `works`, and `effective` wording;
- unsupported disease-treatment wording;
- causal language derived from observational-only evidence;
- human-benefit claims derived from animal/in-vitro-only evidence;
- broad generalization from one small human trial.

Citation governance includes:

- claim-to-citation distance checks;
- stronger enforcement for medically important claims;
- ambiguous multi-proposition/single-cluster detection;
- legitimate citation reuse across claims;
- decorative citation detection;
- internal reviewer snippets;
- exact supporting section/table metadata;
- extraction provenance (`abstract`, `full-text`, `table`, `supplement`, `secondary-source`);
- confidence ceilings and full-text review flags for abstract-only or secondary-only support.

## 1053–1091 — study relevance, independence, sponsorship, and risk of bias

Implementation: `lib/evidence/study-quality.ts`

Study relevance is scored from:

- ingredient match;
- formulation match;
- population match;
- outcome match;
- dose match;
- duration match;
- study design.

Loosely related studies can be retained for context but are prevented from inflating primary synthesis.

Study independence detects:

- multiple publications from one trial registration;
- secondary analyses of one cohort;
- systematic reviews with heavy primary-study overlap.

The model keeps publication count and independent-trial count separate.

Funding and conflict metadata includes:

- industry / independent / mixed / unknown funding;
- sponsor identity;
- disclosed company-employee authors;
- conflicts of interest;
- replication outside the original sponsor.

Industry funding is surfaced transparently but is not an automatic evidence downgrade.

Publication-bias context tracks completed registered trials that currently lack a linked publication and explicitly warns that the published literature may not represent every completed trial.

Standard risk-of-bias domains:

- randomization;
- blinding;
- allocation concealment;
- attrition;
- selective reporting;
- sample size;
- preregistration;
- funding/conflict considerations.

Risk-of-bias and relevance jointly weight synthesis contribution. Raw trial count alone never emits an evidence grade.

## 1092–1100 — outcome normalization and synthesis

Implementation: `lib/evidence/outcomes.ts`

- Outcome synonyms resolve to canonical parent outcomes while retaining uncertainty.
- `sleep quality` and `subjective sleep quality` are not blindly treated as interchangeable; subjective wording is routed for review when instrument identity is unknown.
- Instrument-specific evidence remains separable even when it shares a canonical parent outcome.
- Pittsburgh Sleep Quality Index (PSQI) is tracked explicitly.
- HAM-A and GAD-7 are tracked separately under anxiety severity.
- Perceived Stress Scale (PSS) is tracked explicitly.
- Cognition is hierarchical rather than one flat bucket.
- Memory is the first implemented cognition child in this scope, ending exactly at backlog item 1100.
- Multiple papers from the same independent trial do not inflate the independent-trial count in outcome synthesis.

## Tests and CI

Focused tests:

- `lib/__tests__/claim-freshness.test.ts`
- `lib/__tests__/claim-language.test.ts`
- `lib/__tests__/study-quality.test.ts`
- `lib/__tests__/outcomes.test.ts`

The repository CI workflow runs lint, TypeScript typecheck, and the full Vitest suite on pushes to `main` and non-draft pull requests, so these contracts participate in the existing quality gate.

## Guardrails

1. Never infer a strong clinical conclusion from freshness alone.
2. Never treat old evidence as invalid solely because it is old.
3. Never let a regulatory/web update rewrite a published medical conclusion without review.
4. Never allow study count to substitute for independence, relevance, or bias assessment.
5. Never merge validated outcome instruments into one undifferentiated effect value when instrument identity matters.
6. Never use preclinical or observational evidence language as though it were direct causal human evidence.
