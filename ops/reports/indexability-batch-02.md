# Indexability Batch 02 (Post Batch-01)

## Scope
- Re-ran quality gate after batch-01 baseline.
- Selected only still-blocked entities with credible existing source coverage and no identity-repair dependency.
- Kept validation rules, placeholder detection, and evidence guardrails unchanged.

## Selected entities and rationale
### Herbs selected (5)
1. `mentha-piperita` — close to threshold; placeholder residue in narrative/safety text was fixable with source-consistent wording.
2. `achillea-millefolium` — near-pass with valid effects/sources; required identity text cleanup plus minor narrative repair.
3. `nepeta-cataria` — near-pass with adequate source/effect coverage; placeholder residue localized to a few fields.
4. `papaver-somniferum` — safety-critical profile; replaced placeholder-tainted text with conservative, non-promotional safety-forward wording.
5. `heimia-salicifolia` — source-backed but blocked by placeholder strings in mechanism/dosage/preparation fields.

### Compounds selected (0)
- No new still-blocked compound was both identity-clean and supportable from already promotable, governance-ready candidate sources in this wave.

## Sources promoted this wave
- None.
- Existing registry coverage was sufficient for selected herb cleanup.

## Fields changed per entity
- `mentha-piperita`: `summary`, `mechanism`, `region`, `intensity`, `safetyNotes[]`
- `achillea-millefolium`: `name`, `displayName`, `summary`, `safetyNotes[]`
- `nepeta-cataria`: `summary`, `mechanism`, `region`, `intensity`, `safetyNotes[]`
- `papaver-somniferum`: `description`, `summary`, `mechanism`, `region`, `intensity`, `preparation`, `safetyNotes[]`
- `heimia-salicifolia`: `summary`, `mechanism`, `region`, `duration`, `preparation`, `dosage[]`, `effects[]`, `safetyNotes[]`, `sources[]`

## Before/after indexability counts
- Herbs: **18 → 23** indexable (`+5`)
- Compounds: **10 → 10** indexable (`+0`)

## Unresolved blockers
- `hyoscyamus-niger`: candidate source remains blocked for manual review/metadata correction.
- Compound identity blockers remain for `object-object`, `alpha`, `beta`, and `unverified-cannabinoids`.

## Intentionally skipped
- Already indexable from prior wave (`cbd`, `luteolin`).
- Non-resolvable category/placeholder identities requiring human disambiguation.
