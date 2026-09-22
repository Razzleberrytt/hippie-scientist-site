# Medication and psychoactive compound expansion governance

## Purpose

Extend the existing compound evidence system to prescription medicines, OTC medicines, controlled substances, investigational psychoactives, and recreationally used compounds without creating a parallel publishing system or weakening the existing evidence, source-of-truth, indexability, safety, or promotion gates.

This contract extends—not replaces—`docs/runtime-promotion-governance.md`, `docs/promoting-profiles.md`, and `docs/indexability-governance.md`.

## Entity model

A compound record may connect:

```text
substance / medicine
  → active compound(s)
  → pharmacologic class
  → targets / mechanisms
  → approved indication(s)
  → off-label or investigational outcome(s)
  → formulation / route
  → human evidence
  → adverse effects / warnings
  → interactions
  → dependence / withdrawal context where relevant
  → regulatory status by jurisdiction and review date
  → related compounds, medicines, herbs, and supplements
```

Do not collapse these relationships. A shared target does not establish shared efficacy, a class effect does not prove formulation equivalence, and an investigational outcome is not an approved indication.

## Required claim classes

Medication and psychoactive content must distinguish, when applicable:

- **approved indication** — supported by current authoritative labeling for the named jurisdiction;
- **off-label clinical use** — clearly labeled as off-label and separately evidenced;
- **investigational use** — studied but not established as an approved use;
- **recreational/nonmedical use** — descriptive safety/pharmacology context, never an endorsement;
- **mechanistic hypothesis** — biological plausibility that must not be rendered as clinical efficacy;
- **unsupported/marketing claim** — not promoted into a canonical efficacy claim.

## Provenance hierarchy

Use the source appropriate to the claim rather than one source type for everything.

1. Current regulator/official labeling for approval, contraindication, boxed-warning, REMS/Medication Guide, and jurisdiction-specific regulatory claims.
2. Systematic reviews, meta-analyses, guidelines, and well-designed human studies for efficacy/effect estimates.
3. Primary pharmacology and high-quality reviews for target/mechanism claims.
4. Authoritative surveillance or epidemiology for population-level harms and nonmedical-use patterns.

Every regulatory statement must carry a jurisdiction and review date. Regulatory provenance does not replace peer-reviewed efficacy provenance.

## High-risk safety contract

Controlled substances, sedatives, opioids, stimulants, dissociatives, psychedelics, and other high-risk psychoactives receive stricter review.

Content may explain pharmacology, evidence, adverse effects, interactions, dependence, withdrawal risk, overdose risk, clinical monitoring, and regulatory status. It must not optimize intoxication, euphoria, dangerous combinations, concealment, extraction, illicit manufacture, or evasion of safety controls.

Do not convert trial exposures into recreational protocols or individualized dosing. Do not provide self-directed withdrawal/taper protocols for dependence-prone medicines as a generated default.

## Medication–supplement relationships

Interaction edges require evidence. Mechanistic plausibility alone may be presented as a hypothesis/caution signal but must not be promoted into a confirmed interaction.

Each relationship should identify:
- interacting entities;
- evidence/source type;
- observed vs theoretical status;
- clinically relevant outcome where known;
- population/formulation context;
- review date.

Affiliate or commercial metadata must never alter interaction severity or scientific conclusions.

## Regulatory state

The existing runtime fields for `legal_status`, `controlled_status`, `controlled_schedule`, `regulatory_status`, `last_regulatory_check`, `regulatory_changelog`, and `regulatory_sources` remain the runtime-facing contract.

Regulatory records must be date-aware and jurisdiction-aware. Unknown or stale status fails conservatively; it must not be inferred from a compound class.

## Publication and indexability

The workbook remains source of truth. Generated `public/data` is never hand-edited.

New medication/psychoactive profiles pass the existing promotion and indexability gates. High-risk classification does not automatically make a page unpublishable, but it prohibits automatic promotion when the existing restricted/high-risk policy requires review.

No bulk expansion may bypass:
- source-backed promotion;
- evidence-language validation;
- safety sections;
- scientific/governance review;
- source-of-truth guards;
- publication reconciliation;
- branch protection.

## Comparison pages

Cross-category comparisons may compare evidence quality, approved indications, pharmacology, formulation, adverse effects, interaction context, and regulatory status. They must not declare a universal winner or encourage unsupervised substitution between a medicine and an herb/supplement/recreational substance.

## Initial implementation sequence

1. Establish this contract.
2. Build dated regulatory/labeling provenance support (#5833).
3. Produce the top-50 opportunity scorecard (#5835).
4. Seed bounded clusters (#5821–#5831) behind the same source-of-truth gates.
5. Build interaction relationships (#5832).
6. Add governed cross-category comparisons (#5834).
7. Measure search/AI-answer value before scaling bulk generation.

## Regression contract

Future expansion must not:
- fabricate or infer approval status;
- represent off-label use as approved;
- turn mechanism into efficacy;
- treat one formulation as evidence for all formulations;
- suppress serious safety information to improve conversion;
- weaken restricted-compound review;
- hand-edit generated runtime JSON;
- allow affiliate state to affect scientific conclusions;
- bulk-index thin compound records.
