# Compound Expansion — First-Tranche Inventory

**Date:** 2026-09-22  
**Scope:** Repository-grounded implementation inventory for the first medication/psychoactive tranche. This document records what already exists so implementation does not duplicate pages or accidentally promote thin/generated records.

## Public-site baseline

The public compound library currently exposes a supplement/bioactive-heavy catalog, while the evidence checker already spans hundreds of workbook-backed compounds. Existing public content also discusses medication/substance effects in sleep and interaction contexts. This supports extending the current entity graph rather than creating a separate medication site.

## Repository inventory

| Entity | Existing repository signal | Implementation implication |
|---|---|---|
| Caffeine | dedicated article `content/articles/caffeine-and-sleep-timing.md`; several comparison/focus routes; `public/data/compounds-detail/caffeine.json` | Reconcile existing compound record + article + comparison routes before adding anything new. Treat as anchor relationship entity. |
| Nicotine | dedicated `content/articles/nicotine-vaping-and-sleep.md`; research note; runtime compound + AI entity; product-use firewall | Strong existing anchor. Preserve harm/safety firewall and connect sleep/anxiety/dependence evidence rather than duplicating. |
| Sertraline | medication-class interaction mapping; SSRI comparison; mental-health references; enrichment evidence | Likely new canonical medication entity, but reuse interaction and SSRI evidence infrastructure. |
| Fluoxetine | saffron/depression article; medication-class interaction mapping; SSRI comparison; cached evidence | Likely new canonical medication entity; separate approved indication/regulatory provenance from comparison references. |
| Bupropion | included in medication expansion plan; requires fresh repository/evidence inventory before entity implementation | Do not create thin profile until provenance/evidence inventory is complete. |
| Dextroamphetamine | narcolepsy/excessive-daytime-sleepiness article + dedicated research evidence note | Strong candidate for first medication entity because an evidence route already exists. Preserve indication separation. |
| Modafinil | planned wakefulness cluster; requires fresh inventory before implementation | Pair with narcolepsy/wakefulness architecture only after source reconciliation. |
| Zolpidem | sleep-related-eating-disorder article/research; medication-class interactions; sleep-medication safety guide | Strong safety-first medication candidate; connect complex sleep behavior and sleep-medication context. |
| Naloxone | opioid expansion candidate; requires authoritative regulatory/label inventory | High public-safety value; do not frame as a generic opioid profile. |
| CBD | cannabinoid expansion candidate; current compound library contains cannabinoid-adjacent records such as CBG | Must distinguish prescription cannabidiol from consumer CBD and from cannabis/THC. |

## Implementation rules

1. **Reconcile before create.** Existing authored pages, runtime records, research notes, interaction maps, and enrichment evidence are inputs to the canonical entity.
2. **One canonical entity, many relationships.** Do not create separate duplicate records because an entity appears in sleep, anxiety, cognition, or substance-use contexts.
3. **Medication claims are typed.** Approved indication, off-label use, investigational use, mechanism, and safety/regulatory claims remain distinct.
4. **Existing restricted-term and safety firewalls remain authoritative.**
5. **No generated runtime JSON is hand-edited.**
6. **No indexable profile from inventory alone.** Inventory is discovery, not evidence promotion.
7. **Existing public pages are not rewritten merely to force the new taxonomy.** Migrations should be bounded and preserve working routes/canonicals.

## First build candidates

### Caffeine
Start as an integration/reconciliation transaction, not a new profile. Audit the workbook/runtime compound, sleep-timing article, focus comparisons, related herbs, and interaction edges. Goal: make caffeine the first cross-category anchor demonstrating the new graph.

### Nicotine
Start as a safety/relationship reconciliation. Preserve the existing product-use firewall and connect the compound entity to sleep, anxiety/cognition where evidence supports it, dependence, and relevant regulatory context.

### Dextroamphetamine
Start as the first clearly medication-shaped entity after regulatory provenance is green. Reuse narcolepsy evidence, then add authoritative labeling/approval provenance and indication-specific evidence. Do not generalize narcolepsy evidence to ADHD or vice versa.

### Zolpidem
Start from the existing sleep-safety material. Model approved insomnia use separately from adverse-event/complex-sleep-behavior evidence and interaction context.

### Sertraline / Fluoxetine
Build from shared SSRI class infrastructure but preserve molecule-specific labeling, evidence, adverse effects, interactions, and indication differences. Never clone class text into molecule-level certainty without source support.

## Dependencies

- #5833 regulatory provenance contract should be merged before medication profiles are promoted.
- #5835 scorecard controls queue priority but does not itself authorize publication.
- #5832 interaction architecture should consume canonical entities rather than create duplicate medication records.

## Before → after

- first-tranche entities with repository-level implementation inventory: 0 → 10
- entities with confirmed strong existing integration anchors: 0 → 6
- duplicate-first implementation strategy: possible → explicitly prohibited

## Regression contract

Do not duplicate existing canonical content, hand-edit generated runtime files, infer evidence from mere repository mentions, or promote a medication/psychoactive entity solely because it appears in this inventory.
